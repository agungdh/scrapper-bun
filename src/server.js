import { Hono } from 'hono'
import { getLatestScrape, getLatestOnePieceWithFiles, getLatestGithubTag } from './db/queries.js'

const app = new Hono()

const sources = [
  'the-bully-in-charge',
  'one-piece',
  'adminlte',
  'browser',
]

app.get('/health', (c) => c.json({ status: 'ok' }))

app.get('/api/scrape', async (c) => {
  const [bully, op, adminlte, browser] = await Promise.all([
    getLatestScrape('the-bully-in-charge'),
    getLatestOnePieceWithFiles(),
    getLatestGithubTag('adminlte'),
    getLatestGithubTag('browser'),
  ])
  return c.json({
    'the-bully-in-charge': bully || null,
    'one-piece': op || null,
    adminlte: adminlte || null,
    browser: browser || null,
  })
})

app.get('/api/scrape/the-bully-in-charge', async (c) => {
  const data = await getLatestScrape('the-bully-in-charge')
  if (!data) return c.json({ message: 'not found' }, 404)
  return c.json(data)
})

app.get('/api/scrape/one-piece', async (c) => {
  const data = await getLatestOnePieceWithFiles()
  if (!data) return c.json({ message: 'not found' }, 404)
  return c.json(data)
})

app.get('/api/scrape/adminlte', async (c) => {
  const data = await getLatestGithubTag('adminlte')
  if (!data) return c.json({ message: 'not found' }, 404)
  return c.json(data)
})

app.get('/api/scrape/browser', async (c) => {
  const data = await getLatestGithubTag('browser')
  if (!data) return c.json({ message: 'not found' }, 404)
  return c.json(data)
})

app.onError((err, c) => {
  console.error(err)
  return c.json({ message: 'internal server error' }, 500)
})

export default app
