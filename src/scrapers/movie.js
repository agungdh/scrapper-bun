import { saveGhostInTheCell } from '../db/queries.js'
import { getPage } from './browser.js'

async function withRetry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === retries - 1) throw err
      console.log(`[movie] retry ${i + 1}/${retries}: ${err.message}`)
      await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
}

export async function scrapeMovie(movieUrl) {
  const { page, context } = await getPage()

  try {
    await withRetry(() => page.goto(movieUrl, { waitUntil: 'load', timeout: 15000 }))

    const title = await page.locator('h1').textContent()
    const quality = await page.locator('span.quality a').textContent()

    const result = {
      quality: quality?.trim() || '',
      title: title?.trim() || '',
      url: movieUrl,
      scraped_at: new Date().toISOString(),
    }

    console.log(JSON.stringify(result))
    await saveGhostInTheCell(result)
    return result
  } finally {
    await context.close()
  }
}
