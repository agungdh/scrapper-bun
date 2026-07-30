import { Hono } from 'hono'
import { getLatestScrape, getLatestOnePieceWithFiles, getLatestGithubTag, getLatestYoutubeVideo } from './db/queries.js'

const app = new Hono()

const sources = [
  'the-bully-in-charge',
  'one-piece',
  'adminlte',
  'browser',
  'bennix',
  'programmerzamannow',
]

app.get('/health', (c) => c.json({ status: 'ok' }))

app.get('/api/scrape', async (c) => {
  const [bully, op, adminlte, browser, bennix, pzn] = await Promise.all([
    getLatestScrape('the-bully-in-charge'),
    getLatestOnePieceWithFiles(),
    getLatestGithubTag('adminlte'),
    getLatestGithubTag('browser'),
    getLatestYoutubeVideo('bennix'),
    getLatestYoutubeVideo('programmerzamannow'),
  ])
  return c.json({
    'the-bully-in-charge': bully || null,
    'one-piece': op || null,
    adminlte: adminlte || null,
    browser: browser || null,
    bennix: bennix || null,
    programmerzamannow: pzn || null,
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

app.get('/api/scrape/bennix', async (c) => {
  const data = await getLatestYoutubeVideo('bennix')
  if (!data) return c.json({ message: 'not found' }, 404)
  return c.json(data)
})

app.get('/api/scrape/programmerzamannow', async (c) => {
  const data = await getLatestYoutubeVideo('programmerzamannow')
  if (!data) return c.json({ message: 'not found' }, 404)
  return c.json(data)
})

app.onError((err, c) => {
  console.error(err)
  return c.json({ message: 'internal server error' }, 500)
})

export default app
