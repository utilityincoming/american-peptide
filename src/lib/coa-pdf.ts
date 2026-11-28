// Browser-only PDF text extraction shared by the COA decoder and the batch analyzer.
// A short text layer means the file is probably a scan. We do not OCR it.

export const SCANNED_PDF_MIN_NON_WS_CHARS = 40

export async function extractPdfText(file: File): Promise<{ text: string; nonWsCount: number }> {
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
  const pdfBuffer = await file.arrayBuffer()
  const doc = await pdfjs.getDocument({ data: pdfBuffer.slice(0) }).promise
  let out = ''
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    out += content.items.map((item) => ('str' in item ? String(item.str) : '')).join(' ') + '\n'
  }
  const text = out.trim()
  return { text, nonWsCount: text.replace(/\s+/g, '').length }
}
