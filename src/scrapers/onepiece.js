import { ONE_PIECE_URL } from '../config.js'
import { saveEpisodeWithFiles } from '../db/queries.js'
import { getPage } from './browser.js'

async function withRetry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === retries - 1) throw err
      console.log(`[onepiece] retry ${i + 1}/${retries}: ${err.message}`)
      await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
}

export async function scrapeLatestOnePiece() {
  const { page, context } = await getPage()

  try {
    await withRetry(() => page.goto(ONE_PIECE_URL, { waitUntil: 'load', timeout: 15000 }))

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

    let files = []
    const gofileId = downloadUrl?.match(/gofile\.io\/d\/(\w+)/)?.[1]
    if (gofileId) {
      const { page: goPage, context: goCtx } = await getPage()
      try {
        const apiPromise = goPage.waitForResponse(r => r.url().startsWith('https://api.gofile.io/contents/') && r.status() === 200)
        await goPage.goto(downloadUrl, { waitUntil: 'networkidle', timeout: 30000 })
        const apiRes = await apiPromise
        const apiJson = await apiRes.json()
        if (apiJson.status === 'ok' && apiJson.data?.children) {
          files = Object.values(apiJson.data.children).map(f => ({
            id: f.id,
            name: f.name,
            size: f.size,
            link: f.link,
            mimetype: f.mimetype,
            thumbnail: f.thumbnail,
          }))
        }
      } finally {
        await goCtx.close()
      }
    }

    const result = {
      episode: episodeNum,
      title: title?.trim() || '',
      date,
      url: episodeUrl,
      download_url: downloadUrl || '',
      scraped_at: new Date().toISOString(),
    }

    console.log(JSON.stringify(result))
    await saveEpisodeWithFiles(result, files)
    return result
  } finally {
    await context.close()
  }
}
