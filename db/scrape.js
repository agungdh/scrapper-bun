import sqlite from './index.js';

function tableName(source) {
  return source.replace(/[^a-zA-Z0-9_]/g, '_');
}

export function saveScrape(source, data) {
  const table = tableName(source);
  sqlite.run(
    `INSERT INTO ${table} (chapter, date, url, scraped_at) VALUES (?, ?, ?, ?)`,
    [data.chapter, data.date, data.url, data.scraped_at]
  );
}

export function getLatestScrape(source) {
  const table = tableName(source);
  return sqlite.query(`SELECT * FROM ${table} ORDER BY id DESC LIMIT 1`).get();
}
