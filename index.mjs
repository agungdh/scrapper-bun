import 'dotenv/config';
import { chromium } from 'playwright';
import { saveScrape } from './db/scrape.js';

const MANGA_URL = process.env.URL_THE_BULLY_IN_CHARGE;
const INTERVAL_MINUTES = parseInt(process.env.INTERVAL_MINUTES || '10', 10);
const SCRAP_ON_START = process.env.SCRAP_ON_START === 'true';

async function scrapeLatestChapter() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
  });
  const page = await context.newPage();

  try {
    await page.goto(MANGA_URL, { waitUntil: 'networkidle', timeout: 30000 });

    const latestRow = page.locator('table#Daftar_Chapter tbody#daftarChapter tr[data-ch]').first();
    await latestRow.waitFor({ state: 'visible', timeout: 10000 });

    const chapterText = await latestRow.locator('td.judulseries a span').textContent();
    const chapterNum = parseInt(chapterText?.replace('Chapter ', '').trim(), 10);

    const dateRaw = await latestRow.locator('td.tanggalseries').textContent();
    const [day, month, year] = (dateRaw?.trim() || '').split('/');
    const date = `${year}-${month}-${day}`;

    const { origin } = new URL(MANGA_URL);
    const href = await latestRow.locator('td.judulseries a').getAttribute('href');
    const fullUrl = href ? `${origin}${href}` : '';

    const result = {
      chapter: chapterNum,
      date,
      url: fullUrl,
      scraped_at: new Date().toISOString(),
    };

    console.log(JSON.stringify(result));

    saveScrape('the-bully-in-charge', result);

    return result;
  } finally {
    await browser.close();
  }
}

async function main() {
  if (!MANGA_URL) {
    console.error('URL_THE_BULLY_IN_CHARGE not set in .env');
    process.exit(1);
  }

  console.log(`Scraping every ${INTERVAL_MINUTES} minutes...\n`);

  const run = async () => {
    try {
      await scrapeLatestChapter();
      console.log('---');
    } catch (err) {
      console.error('Error:', err.message);
      console.log('---');
    }
  };

  const interval = setInterval(run, INTERVAL_MINUTES * 60 * 1000);

  if (SCRAP_ON_START) {
    await run();
  } else {
    console.log(`First scrape in ${INTERVAL_MINUTES} minutes...`);
  }

  process.on('SIGINT', () => {
    clearInterval(interval);
    process.exit(0);
  });
}

main();
