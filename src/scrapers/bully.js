import { MANGA_URL } from '../config.js'
import { saveScrape } from '../db/queries.js'
import { createBrowser } from './browser.js'

export async function scrapeLatestChapter() {
  const { browser, context } = await createBrowser()
  const page = await context.newPage()

  try {
    await page.goto(MANGA_URL, { waitUntil: 'load', timeout: 15000 })

    const latestRow = page.locator('table#Daftar_Chapter tbody#daftarChapter tr[data-ch]').first()
    await latestRow.waitFor({ state: 'visible', timeout: 10000 })

    const chapterText = await latestRow.locator('td.judulseries a span').textContent()
    const chapterNum = parseInt(chapterText?.replace('Chapter ', '').trim(), 10)

    const dateRaw = await latestRow.locator('td.tanggalseries').textContent()
    const [day, month, year] = (dateRaw?.trim() || '').split('/')
    const date = `${year}-${month}-${day}`

    const { origin } = new URL(MANGA_URL)
    const href = await latestRow.locator('td.judulseries a').getAttribute('href')
    const fullUrl = href ? `${origin}${href}` : ''

    const result = {
      chapter: chapterNum,
      date,
      url: fullUrl,
      scraped_at: new Date().toISOString(),
    }

    console.log(JSON.stringify(result))

    await saveScrape('the-bully-in-charge', result)

    return result
  } finally {
    await browser.close()
  }
}
