export const MANGA_URL = process.env.URL_THE_BULLY_IN_CHARGE
export const ONE_PIECE_URL = process.env.URL_ONE_PIECE
export const DB_PATH = process.env.DB_PATH || './data/scrapper.db'
export const INTERVAL_MINUTES = parseInt(process.env.INTERVAL_MINUTES || '10', 10)
export const CLEANUP_INTERVAL_MINUTES = parseInt(process.env.CLEANUP_INTERVAL_MINUTES || '60', 10)
export const SCRAP_ON_START = process.env.SCRAP_ON_START === 'true'
export const PORT = parseInt(process.env.PORT || '3000', 10)

export const GITHUB_ADMINLTE = process.env.GITHUB_ADMINLTE || 'colorlibhq/adminlte'
export const GITHUB_BROWSER = process.env.GITHUB_BROWSER || 'lightpanda-io/browser'

export const YOUTUBE_BENNIX = process.env.YOUTUBE_BENNIX || 'Bennix'
export const YOUTUBE_PZN = process.env.YOUTUBE_PZN || 'ProgrammerZamanNow'
