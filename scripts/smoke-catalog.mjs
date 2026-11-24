import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const origin = process.env.CATALOG_SMOKE_ORIGIN ?? 'http://localhost:3000'
// Exercise the live MCP tool and the HTTP API against the same built site.
const mcpResponse = await fetch(origin + '/api/mcp', {
  method: 'POST',
  headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: { name: 'search_peptides', arguments: { query: 'Ozempic' } },
  }),
})
assert.equal(mcpResponse.status, 200)
const mcpBody = await mcpResponse.text()
const mcpData = mcpBody.split('\n').find((line) => line.startsWith('data: '))?.slice(6)
const mcpResult = JSON.parse(mcpData ?? mcpBody).result
const mcpSlugs = JSON.parse(mcpResult.content[0].text).peptides.map(({ slug }) => slug).sort()
assert(mcpSlugs.includes('semaglutide'))

const apiResponse = await fetch(origin + '/api/v2/catalog?q=Ozempic')
assert.equal(apiResponse.status, 200)
assert.equal(apiResponse.headers.get('cache-control'), 'private, no-store')
assert.deepEqual((await apiResponse.json()).peptides.map(({ slug }) => slug), mcpSlugs)

const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
    : {},
)

try {
  for (const viewport of [{ width: 375, height: 640 }, { width: 1280, height: 900 }]) {
    const context = await browser.newContext({ viewport })
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

      await page.getByRole('heading', { name: 'Research peptide catalog' }).waitFor()
      const search = page.getByRole('searchbox', { name: 'Search name or alias' })
      const searchBox = await search.boundingBox()
      assert(searchBox && searchBox.y >= 0 && searchBox.y + searchBox.height <= viewport.height)
      assert.equal(await page.evaluate(() => window.scrollY), 0)

      const searchStart = performance.now()
      await search.fill('no-such-compound')
      await page.getByText('No results for “no-such-compound”', { exact: true }).waitFor()
      const searchMs = performance.now() - searchStart
      const scriptBytes = await page.evaluate(() =>
        performance.getEntriesByType('resource')
          .filter(({ name }) => new URL(name).pathname.startsWith('/_next/static/') && name.endsWith('.js'))
          .reduce((total, resource) => total + resource.encodedBodySize, 0),
      )
      console.log(`Catalog ${viewport.width}px: ${searchMs.toFixed(0)} ms search smoke, ${scriptBytes} encoded script bytes`)
      await page.getByRole('button', { name: 'Clear filters', exact: true }).click()
      assert.equal(await search.inputValue(), '')
      await search.fill('BPC-157')
      await page.getByRole('link', { name: 'View BPC-157', exact: true }).waitFor()
      await page.getByRole('link', { name: 'View Semaglutide', exact: true }).waitFor({ state: 'hidden' })
      await page.getByRole('button', { name: 'Add BPC-157 to comparison' }).click()

      await search.fill('Semaglutide')
      await page.getByRole('button', { name: 'Add Semaglutide to comparison' }).click()
      await page.getByRole('link', { name: 'Compare', exact: true }).click()
      await page.waitForURL(origin + '/catalog/compare?ids=bpc-157,semaglutide')
      await page.getByRole('heading', { level: 1, name: /compare/i }).waitFor()

      await page.goto(origin + '/catalog?q=Ozempic&category=metabolic&utm_source=smoke#catalog')
      await page.waitForFunction(() => document.querySelector('input[type=search]')?.value === 'Ozempic')
      await page.getByRole('link', { name: 'View Semaglutide', exact: true }).waitFor()
      await page.getByRole('button', { name: 'All', exact: true }).click()
      assert.equal(new URL(page.url()).searchParams.get('category'), null)
      await page.goBack()
      await page.waitForURL('**/catalog?q=Ozempic&category=metabolic&utm_source=smoke#catalog')
      await page.reload()
      await page.waitForFunction(() => document.querySelector('input[type=search]')?.value === 'Ozempic')
      await page.getByRole('button', { name: 'Clear filters', exact: true }).click()
      assert.equal(new URL(page.url()).search, '?utm_source=smoke')
      assert.equal(new URL(page.url()).hash, '#catalog')

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
      console.log(`Catalog smoke passed at ${viewport.width}px`)
    } finally {
      await context.close()
    }
  }
} finally {
  await browser.close()
}
