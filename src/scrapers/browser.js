import { chromium } from 'playwright'

let browser = null

export async function getPage() {
  if (!browser) {
    browser = await chromium.launch({ headless: true })
  }
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
  })
  const page = await context.newPage()
  return { page, context }
}

export async function closeBrowser() {
  if (browser) {
    await browser.close()
    browser = null
  }
}
