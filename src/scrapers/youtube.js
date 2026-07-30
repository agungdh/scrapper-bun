import { getPage } from './browser.js'
import { saveYoutubeVideo } from '../db/queries.js'

export async function scrapeLatestVideo(channel, handle) {
  const { page, context } = await getPage()
  const url = `https://www.youtube.com/@${handle}/videos`

  try {
    await page.goto(url, { waitUntil: 'networkidle' })
    await page.waitForSelector('ytd-rich-item-renderer a#video-title-link', { timeout: 15000 })

    const data = await page.$eval('ytd-rich-item-renderer', (el) => {
      const link = el.querySelector('a#video-title-link')
      const title = link ? link.textContent.trim() : ''
      const href = link ? link.href : ''
      const videoId = href ? new URL(href).searchParams.get('v') : ''
      const spans = el.querySelectorAll('#metadata-line span')
      const views = spans[0] ? spans[0].textContent.trim() : ''
      const publishedAt = spans[1] ? spans[1].textContent.trim() : ''
      return { title, video_id: videoId, url: href, views, published_at: publishedAt }
    })

    const result = {
      channel,
      ...data,
      scraped_at: new Date().toISOString(),
    }

    await saveYoutubeVideo(result)
    console.log(JSON.stringify(result))
    return result
  } finally {
    await context.close()
  }
}
