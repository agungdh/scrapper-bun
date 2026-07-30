import { INTERVAL_MINUTES, CLEANUP_INTERVAL_MINUTES, SCRAP_ON_START, GITHUB_ADMINLTE, GITHUB_BROWSER, YOUTUBE_BENNIX, YOUTUBE_PZN } from './config.js'
import { scrapeLatestChapter } from './scrapers/bully.js'
import { scrapeLatestOnePiece } from './scrapers/onepiece.js'
import { scrapeLatestGithubTag } from './scrapers/github.js'
import { scrapeLatestVideo } from './scrapers/youtube.js'
import { deleteAllOldScrapes } from './db/queries.js'
import { closeBrowser } from './scrapers/browser.js'

async function runManga() {
  try {
    await scrapeLatestChapter()
    console.log('---')
  } catch (err) {
    console.error('Error:', err.message)
    console.log('---')
  }
}

async function runAnime() {
  try {
    await scrapeLatestOnePiece()
    console.log('---')
  } catch (err) {
    console.error('Error:', err.message)
    console.log('---')
  }
}

async function runYoutube() {
  const channels = [
    { name: 'bennix', handle: YOUTUBE_BENNIX },
    { name: 'programmerzamannow', handle: YOUTUBE_PZN },
  ]
  await Promise.all(channels.map(async ({ name, handle }) => {
    try {
      await scrapeLatestVideo(name, handle)
      console.log('---')
    } catch (err) {
      console.error(`[${name}] Error:`, err.message)
      console.log('---')
    }
  }))
}

async function runGithubTags() {
  const repos = [
    { name: 'adminlte', full: GITHUB_ADMINLTE },
    { name: 'browser', full: GITHUB_BROWSER },
  ]
  await Promise.all(repos.map(async ({ name, full }) => {
    try {
      const [owner, repo] = full.split('/')
      await scrapeLatestGithubTag(name, owner, repo)
      console.log('---')
    } catch (err) {
      console.error(`[${name}] Error:`, err.message)
      console.log('---')
    }
  }))
}

async function runAll() {
  await Promise.all([
    runManga(),
    runAnime(),
    runGithubTags(),
    runYoutube(),
  ])
}

async function cleanup() {
  try {
    await deleteAllOldScrapes()
  } catch (err) {
    console.error('[cleanup] Error:', err.message)
  }
}

export function startScheduler() {
  const cleanupInterval = setInterval(cleanup, CLEANUP_INTERVAL_MINUTES * 60 * 1000)

  async function scheduleNext() {
    await runAll()
    setTimeout(scheduleNext, INTERVAL_MINUTES * 60 * 1000)
  }

  cleanup()

  if (SCRAP_ON_START) {
    scheduleNext()
  } else {
    setTimeout(scheduleNext, INTERVAL_MINUTES * 60 * 1000)
    console.log(`First scrape in ${INTERVAL_MINUTES} minutes...`)
  }

  process.on('SIGINT', async () => {
    clearInterval(cleanupInterval)
    await closeBrowser()
    process.exit(0)
  })
}
