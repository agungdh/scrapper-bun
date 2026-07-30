import { MANGA_URL, ONE_PIECE_URL, GITHUB_ADMINLTE, GITHUB_BROWSER, YOUTUBE_BENNIX, YOUTUBE_PZN, PORT, INTERVAL_MINUTES, CLEANUP_INTERVAL_MINUTES } from './config.js'
import app from './server.js'
import { startScheduler } from './scheduler.js'

if (!MANGA_URL) {
  console.error('URL_THE_BULLY_IN_CHARGE not set in .env')
  process.exit(1)
}

if (!ONE_PIECE_URL) {
  console.error('URL_ONE_PIECE not set in .env')
  process.exit(1)
}

if (!GITHUB_ADMINLTE) {
  console.error('GITHUB_ADMINLTE not set in .env')
  process.exit(1)
}

if (!GITHUB_BROWSER) {
  console.error('GITHUB_BROWSER not set in .env')
  process.exit(1)
}

if (!YOUTUBE_BENNIX) {
  console.error('YOUTUBE_BENNIX not set in .env')
  process.exit(1)
}

if (!YOUTUBE_PZN) {
  console.error('YOUTUBE_PZN not set in .env')
  process.exit(1)
}

const server = Bun.serve({ fetch: app.fetch, port: PORT })

console.log(`API server running on http://localhost:${PORT}`)
console.log(`Scraping every ${INTERVAL_MINUTES} minutes...`)
console.log(`Cleanup old data every ${CLEANUP_INTERVAL_MINUTES} minutes...`)

startScheduler()

export default server
