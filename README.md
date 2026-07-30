# scrapper-bun

Scheduled web scraping service with REST API, built with Bun.

## Features

- **Manga scraper** — latest chapter updates
- **Anime scraper** — latest episode with download links
- **YouTube scraper** — latest videos from multiple channels
- **GitHub tags scraper** — latest tags from multiple repos
- **Movie scraper** — movie quality/title info
- **Scheduler** — periodic scraping with configurable interval
- **Auto-cleanup** — removes scraped data older than 24 hours
- **REST API** — query latest scraped data per source

## Tech Stack

| Technology | Usage |
|---|---|
| [Bun](https://bun.sh) | JavaScript runtime |
| [Hono](https://hono.dev) | HTTP framework |
| [Playwright](https://playwright.dev) | Browser automation |
| [Drizzle ORM](https://orm.drizzle.team) | Database ORM |
| [libSQL](https://libsql.org) / SQLite | Database |

## Setup

```bash
# Install dependencies
bun install

# Install Playwright browsers
npx playwright install chromium

# Copy environment config
cp .env.example .env

# Edit .env with your target URLs
# (see Environment Variables section below)

# Run database migrations
bun run migrate

# Start the server
bun start
```

Server runs on `http://localhost:3000` by default.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `URL_THE_BULLY_IN_CHARGE` | — | Manga scraper target URL |
| `URL_ONE_PIECE` | — | Anime scraper target URL |
| `URL_GHOST_IN_THE_CELL` | — | Movie scraper target URL |
| `GITHUB_ADMINLTE` | `colorlibhq/adminlte` | GitHub repo (owner/repo) |
| `GITHUB_BROWSER` | `lightpanda-io/browser` | GitHub repo (owner/repo) |
| `YOUTUBE_BENNIX` | `Bennix` | YouTube channel handle |
| `YOUTUBE_PZN` | `ProgrammerZamanNow` | YouTube channel handle |
| `DB_PATH` | `./data/scrapper.db` | SQLite database path |
| `PORT` | `3000` | HTTP server port |
| `INTERVAL_MINUTES` | `10` | Scraping interval |
| `CLEANUP_INTERVAL_MINUTES` | `60` | Old data cleanup interval |
| `SCRAP_ON_START` | `false` | Scrape immediately on startup |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/scrape` | Latest data from all sources |
| `GET` | `/api/scrape/the-bully-in-charge` | Latest manga chapter |
| `GET` | `/api/scrape/one-piece` | Latest anime episode + files |
| `GET` | `/api/scrape/adminlte` | Latest AdminLTE tag |
| `GET` | `/api/scrape/browser` | Latest Browser tag |
| `GET` | `/api/scrape/bennix` | Latest Bennix video |
| `GET` | `/api/scrape/programmerzamannow` | Latest PZN video |
| `GET` | `/api/scrape/ghost-in-the-cell` | Latest movie data |
| `POST` | `/api/scrape/ghost-in-the-cell` | Trigger movie scrape with `{ "url": "..." }` |

## Project Structure

```
scrapper-bun/
├── src/
│   ├── index.js          # Entry point (server + scheduler)
│   ├── server.js         # Hono REST API routes
│   ├── scheduler.js      # Periodic scraper runner
│   ├── config.js         # Environment config loader
│   ├── db/
│   │   ├── index.js      # DB client initialization
│   │   ├── schema.js     # Drizzle table definitions
│   │   └── queries.js    # CRUD operations
│   └── scrapers/
│       ├── browser.js    # Playwright headless browser
│       ├── bully.js      # Manga scraper
│       ├── onepiece.js   # Anime scraper
│       ├── youtube.js    # YouTube scraper
│       ├── github.js     # GitHub tags scraper
│       └── movie.js      # Movie scraper
├── scripts/
│   └── migrate.js        # Migration runner
├── drizzle/              # Database migrations
├── playwright.config.ts  # Playwright test config
└── .env.example          # Environment template
```

## License

ISC
