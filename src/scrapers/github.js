import { getPage } from './browser.js'
import { saveGithubTag } from '../db/queries.js'

export async function scrapeLatestGithubTag(sourceName, owner, repo) {
  const { page, context } = await getPage()
  const url = `https://github.com/${owner}/${repo}/tags`

  try {
    await page.goto(url, { waitUntil: 'networkidle' })
    await page.waitForSelector('.Box-row', { timeout: 15000 })

    const data = await page.$eval('.Box-row', (el) => {
      const tag = el.querySelector('a.Link--primary')
      const commitLink = el.querySelector('a[href*="/commit/"]')
      const time = el.querySelector('relative-time')
      const hash = commitLink ? commitLink.href.split('/commit/')[1] || '' : ''
      const date = time ? time.getAttribute('datetime') || '' : ''
      return {
        tag_name: tag ? tag.textContent.trim() : '',
        hash,
        date,
      }
    })

    const result = {
      repo: sourceName,
      ...data,
      scraped_at: new Date().toISOString(),
    }

    await saveGithubTag(result)
    console.log(JSON.stringify(result))
    return result
  } finally {
    await context.close()
  }
}
