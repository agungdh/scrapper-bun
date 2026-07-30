import { getPage } from './browser.js'
import { saveYoutubeVideo } from '../db/queries.js'

export async function scrapeLatestVideo(channel, handle) {
  const { page, context } = await getPage()
  const url = `https://www.youtube.com/@${handle}/videos`

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForSelector('#page-manager', { timeout: 20000 })

    let data = await parseFromScript(page)
    if (!data) data = await parseFromDom(page)

    if (!data || !data.video_id) throw new Error('No video found')

    const result = { channel, ...data, scraped_at: new Date().toISOString() }

    await saveYoutubeVideo(result)
    console.log(JSON.stringify(result))
    return result
  } finally {
    await context.close()
  }
}

async function parseFromScript(page) {
  return await page.evaluate(() => {
    try {
      const ytData = window.ytInitialData
      if (!ytData) return null
      const tabs = ytData?.contents?.twoColumnBrowseResultsRenderer?.tabs
      if (!tabs) return null
      const videosTab = tabs.find(t => t.tabRenderer?.title === 'Videos')
      const contents = videosTab?.tabRenderer?.content?.richGridRenderer?.contents
      if (!contents) return null
      const first = contents.find(c => c.richItemRenderer?.content?.lockupViewModel)
      if (!first) return null
      const v = first.richItemRenderer.content.lockupViewModel
      const meta = v?.metadata?.lockupMetadataViewModel
      const rows = meta?.metadata?.contentMetadataViewModel?.metadataRows?.[0]?.metadataParts
      const badge = v?.contentImage?.thumbnailViewModel?.overlays?.[0]?.thumbnailBottomOverlayViewModel?.badges?.[0]?.thumbnailBadgeViewModel
      return {
        title: meta?.title?.content || '',
        video_id: v.contentId || '',
        url: `https://www.youtube.com/watch?v=${v.contentId || ''}`,
        duration: badge?.text || '',
        views: rows?.[0]?.text?.content || '',
        published_at: rows?.[1]?.text?.content || '',
      }
    } catch { return null }
  })
}

async function parseFromDom(page) {
  const link = page.locator('a[href*="/watch?v="]').first()
  if (!(await link.count())) return null
  const href = await link.getAttribute('href')
  if (!href) return null
  const videoId = new URL(href, 'https://www.youtube.com').searchParams.get('v')
  const title = (await link.getAttribute('title')) || (await link.textContent()) || ''
  return { title, video_id: videoId || '', url: `https://www.youtube.com/watch?v=${videoId}`, views: '', published_at: '' }
}
