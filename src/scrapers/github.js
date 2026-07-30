import { getPage } from './browser.js'
import { saveGithubTag } from '../db/queries.js'

export async function scrapeLatestGithubTag(sourceName, owner, repo) {
  const { page, context } = await getPage()
  const url = `https://github.com/${owner}/${repo}/tags`

  try {
    await page.goto(url, { waitUntil: 'networkidle' })
    await page.waitForSelector('.Box-row', { timeout: 15000 })

    const tagName = await page.$eval('.Box-row', (el) => {
      const link = el.querySelector('a.Link--primary')
      return link ? link.textContent.trim() : ''
    })

    const data = {
      repo: sourceName,
      tag_name: tagName,
      scraped_at: new Date().toISOString(),
    }

    await saveGithubTag(data)
    console.log(JSON.stringify(data))
    return data
  } finally {
    await context.close()
  }
}
