# AGENTS.md — Scrapper-Bun Conventions

## Tech Stack

- **Runtime:** Bun (not Node.js)
- **HTTP:** Hono framework
- **Database:** SQLite via libSQL + Drizzle ORM
- **Browser automation:** Playwright (Chromium headless)
- **Module system:** ESM (`"type": "module"` in package.json)

## Key Commands

```bash
bun start           # Run server + scheduler
bun run migrate     # Run Drizzle migrations
npx playwright install chromium  # Install browser for Playwright
```

## Code Conventions

- No JSDoc comments — keep code clean
- Use existing patterns when adding new scrapers or endpoints
- All source files live under `src/`
- Scrapers go in `src/scrapers/`
- Database schema/queries go in `src/db/`

## Project Structure

```
src/
├── index.js           # Validates env vars, starts Hono server + scheduler
├── server.js          # Hono app with route definitions
├── scheduler.js       # setInterval-based scheduler, runs all scrapers
├── config.js          # Reads process.env with defaults
├── db/
│   ├── index.js       # libSQL client + Drizzle init (WAL mode)
│   ├── schema.js      # Drizzle table definitions (6 tables)
│   └── queries.js     # Save/get/delete query functions
└── scrapers/
    ├── browser.js     # Playwright browser launcher (lazy, singleton)
    ├── bully.js       # Manga chapter scraper
    ├── onepiece.js    # Anime episode + GoFile scraper
    ├── youtube.js     # YouTube latest video scraper
    ├── github.js      # GitHub tags scraper
    └── movie.js       # Movie scraper
```

## Database

- SQLite with WAL mode
- Tables: `the_bully_in_charge`, `one_piece`, `one_piece_files`, `github_tags`, `youtube_videos`, `ghost_in_the_cell`
- Migrations managed via Drizzle Kit, stored in `drizzle/`
- Old records automatically deleted after 24 hours

## Scrapers Pattern

All scrapers follow this pattern:

1. Accept target URL (from config or parameter)
2. Launch Playwright page via `browser.js`
3. Parse DOM for target data
4. Save to database via `queries.js`
5. Return or log result

## Adding a New Scraper

1. Create file in `src/scrapers/`
2. Use shared `getPage()` from `browser.js` for Playwright pages
3. Add save/query functions to `src/db/queries.js`
4. Add table definition to `src/db/schema.js`
5. Generate migration: `bunx drizzle-kit generate`
6. Run migration: `bun run migrate`
7. Add endpoint to `src/server.js`
8. Add to scheduler in `src/scheduler.js`

## API Conventions

- All responses are JSON
- Individual source endpoints return `404` with `{ message: "not found" }` when empty
- The combined `/api/scrape` endpoint returns `null` for sources with no data
- Error handler returns `500` with `{ message: "internal server error" }`

## Environment Variables

- Real URLs go in `.env` (gitignored)
- Use `.env.example` as template (placeholder URLs only)
- Never commit real target URLs

## Testing

- Playwright test config exists at `playwright.config.ts`
- Test directory: `./tests` (not yet created)
- Test runner: `npx playwright test`

## Security

- `.env` is gitignored — do not expose real scraper targets
- Do not add secrets or API keys to committed files
- Browser anti-detection measures are in `browser.js`
