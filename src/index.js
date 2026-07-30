import { MANGA_URL, ONE_PIECE_URL, PORT, INTERVAL_MINUTES, CLEANUP_INTERVAL_MINUTES } from './config.js'
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

const server = Bun.serve({ fetch: app.fetch, port: PORT })

console.log(`API server running on http://localhost:${PORT}`)
console.log(`Scraping every ${INTERVAL_MINUTES} minutes...`)
console.log(`Cleanup old data every ${CLEANUP_INTERVAL_MINUTES} minutes...\n`)

startScheduler()

export default server
