import sqlite from './index.js';

function tableName(source) {
  const name = source.replace(/[^a-zA-Z0-9_]/g, '_');
  return `scrape_${name}`;
}

export function ensureTable(source) {
  const table = tableName(source);
  sqlite.run(`CREATE TABLE IF NOT EXISTS ${table} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chapter TEXT NOT NULL,
    date TEXT NOT NULL,
    url TEXT NOT NULL,
    scraped_at TEXT NOT NULL
  )`);
  return table;
}

export function saveScrape(source, data) {
  const table = ensureTable(source);
  sqlite.run(
    `INSERT INTO ${table} (chapter, date, url, scraped_at) VALUES (?, ?, ?, ?)`,
    [data.chapter, data.date, data.url, data.scraped_at]
  );
}

export function getLatestScrape(source) {
  const table = ensureTable(source);
  return sqlite.query(`SELECT * FROM ${table} ORDER BY id DESC LIMIT 1`).get();
}
