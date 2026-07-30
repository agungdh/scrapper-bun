import { Hono } from 'hono'
import { chromium } from 'playwright'
import { saveScrape, getLatestScrape, deleteOldScrapes } from './db/scrape.js'

const MANGA_URL = process.env.URL_THE_BULLY_IN_CHARGE
const ONE_PIECE_URL = process.env.URL_ONE_PIECE
const INTERVAL_MINUTES = parseInt(process.env.INTERVAL_MINUTES || '10', 10)
const CLEANUP_INTERVAL_MINUTES = parseInt(process.env.CLEANUP_INTERVAL_MINUTES || '60', 10)
const SCRAP_ON_START = process.env.SCRAP_ON_START === 'true'

async function scrapeLatestChapter() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
  })
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

    saveScrape('the-bully-in-charge', result)

    return result
  } finally {
    await browser.close()
  }
}

async function scrapeLatestOnePiece() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
  })
  const page = await context.newPage()

  try {
    await page.goto(ONE_PIECE_URL, { waitUntil: 'load', timeout: 15000 })

    const latestLink = page.locator('a:has(span.epcurlast)').first()
    await latestLink.waitFor({ state: 'visible', timeout: 10000 })

    const episodeText = await latestLink.locator('span.epcurlast').textContent()
    const episodeNum = parseInt(episodeText?.replace('Episode ', '').trim(), 10)
    const { origin } = new URL(ONE_PIECE_URL)
    const episodeHref = await latestLink.getAttribute('href')
    const episodeUrl = episodeHref
      ? (episodeHref.startsWith('http') ? episodeHref : `${origin}${episodeHref}`)
      : ''

    await page.goto(episodeUrl, { waitUntil: 'load', timeout: 15000 })

    const title = await page.locator('h1.entry-title').textContent()

    const downloadLink = page.locator('a[aria-label="Download"]').first()
    await downloadLink.waitFor({ state: 'visible', timeout: 10000 })
    const downloadUrl = await downloadLink.getAttribute('href')

    const datePublished = await page.locator('meta[property="article:published_time"]').getAttribute('content')
    const date = datePublished ? datePublished.split('T')[0] : new Date().toISOString().split('T')[0]

    const result = {
      episode: episodeNum,
      title: title?.trim() || '',
      date,
      url: episodeUrl,
      download_url: downloadUrl || '',
      scraped_at: new Date().toISOString(),
    }

    console.log(JSON.stringify(result))

    saveScrape('one-piece', result)

    return result
  } finally {
    await browser.close()
  }
}

const app = new Hono()

app.get('/health', (c) => c.json({ status: 'ok' }))

app.get('/api/scrape/the-bully-in-charge', async (c) => {
  const data = await getLatestScrape('the-bully-in-charge')
  if (!data) return c.json({ message: 'not found' }, 404)
  return c.json(data)
})

app.get('/api/scrape/one-piece', async (c) => {
  const data = await getLatestScrape('one-piece')
  if (!data) return c.json({ message: 'not found' }, 404)
  return c.json(data)
})

app.onError((err, c) => {
  console.error(err)
  return c.json({ message: 'internal server error' }, 500)
})

if (!MANGA_URL) {
  console.error('URL_THE_BULLY_IN_CHARGE not set in .env')
  process.exit(1)
}

if (!ONE_PIECE_URL) {
  console.error('URL_ONE_PIECE not set in .env')
  process.exit(1)
}

const PORT = parseInt(process.env.PORT || '3000', 10)

Bun.serve({ fetch: app.fetch, port: PORT })

console.log(`API server running on http://localhost:${PORT}`)
console.log(`Scraping every ${INTERVAL_MINUTES} minutes...`)
console.log(`Cleanup old data every ${CLEANUP_INTERVAL_MINUTES} minutes...\n`)

const runManga = async () => {
  try {
    await scrapeLatestChapter()
    console.log('---')
  } catch (err) {
    console.error('Error:', err.message)
    console.log('---')
  }
}

const runAnime = async () => {
  try {
    await scrapeLatestOnePiece()
    console.log('---')
  } catch (err) {
    console.error('Error:', err.message)
    console.log('---')
  }
}

const interval = setInterval(runManga, INTERVAL_MINUTES * 60 * 1000)
const intervalAnime = setInterval(runAnime, INTERVAL_MINUTES * 60 * 1000)

if (SCRAP_ON_START) {
  await runManga()
  await runAnime()
} else {
  console.log(`First scrape in ${INTERVAL_MINUTES} minutes...`)
}

const cleanup = async () => {
  try {
    deleteOldScrapes('the-bully-in-charge')
    deleteOldScrapes('one-piece')
  } catch (err) {
    console.error('[cleanup] Error:', err.message)
  }
}

const cleanupInterval = setInterval(cleanup, CLEANUP_INTERVAL_MINUTES * 60 * 1000)

cleanup()

process.on('SIGINT', () => {
  clearInterval(interval)
  clearInterval(intervalAnime)
  clearInterval(cleanupInterval)
  process.exit(0)
})
