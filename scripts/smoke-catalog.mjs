import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const origin = process.env.CATALOG_SMOKE_ORIGIN ?? 'http://localhost:3000'
const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
    : {},
)

try {
  for (const width of [375, 1280]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } })
    try {
      await context.route('**/*', (route) =>
        new URL(route.request().url()).origin === origin ? route.continue() : route.abort(),
      )

      // Capture the real response without letting Chromium follow it to the vendor.
      await context.route('**/go/absim-peptides*', async (route) => {
        const response = await route.fetch({ maxRedirects: 0 })
        await route.fulfill({
          json: { status: response.status(), location: response.headers().location },
        })
      })

      const page = await context.newPage()
      await page.goto(origin + '/catalog')
      await page.getByRole('button', { name: 'I understand', exact: true }).click()

      const referral = page.getByRole('link', { name: 'Browse research compounds at ABSIM' })
      const disclosure = page.getByText('We may earn a commission if you purchase through this link.', {
        exact: true,
      })
      await disclosure.waitFor()
      const button = await referral.boundingBox()
      assert(button && button.x >= 0 && button.x + button.width <= width && button.height >= 44)

      const [vendorPage] = await Promise.all([
        context.waitForEvent('page'),
        referral.press('Enter'),
      ])
      await vendorPage.waitForURL(origin + '/go/absim-peptides')
      assert.deepEqual(JSON.parse(await vendorPage.locator('body').innerText()), {
        status: 302,
        location: 'https://absimpeptides.com/?ref=americanpeptide',
      })
      await vendorPage.close()

      const search = page.getByPlaceholder('Search name or alias')
      await search.fill('BPC-157')
      await page.getByRole('link', { name: 'View BPC-157', exact: true }).waitFor()
      await page.getByRole('link', { name: 'View Semaglutide', exact: true }).waitFor({ state: 'hidden' })
      await page.getByRole('button', { name: 'Add BPC-157 to comparison' }).click()

      await search.fill('Semaglutide')
      await page.getByRole('button', { name: 'Add Semaglutide to comparison' }).click()
      await page.getByRole('link', { name: 'Compare', exact: true }).click()
      await page.waitForURL(origin + '/catalog/compare?ids=bpc-157,semaglutide')
      await page.getByRole('heading', { level: 1, name: /compare/i }).waitFor()

      await page.goto(origin + '/catalog/bpc-157')
      await page.getByText(/See the Certificate of Analysis tab on the ABSIM listing/).waitFor()
      const [listing] = await Promise.all([
        context.waitForEvent('page'),
        page.getByRole('link', { name: 'View listing at ABSIM' }).click(),
      ])
      await listing.waitForURL(origin + '/go/absim-peptides?p=bpc-157')
      assert.deepEqual(JSON.parse(await listing.locator('body').innerText()), {
        status: 302,
        location: 'https://absimpeptides.com/product/bpc-157/?ref=americanpeptide',
      })
      console.log(`Catalog smoke passed at ${width}px`)
    } finally {
      await context.close()
    }
  }
} finally {
  await browser.close()
}
