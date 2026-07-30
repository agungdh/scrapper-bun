import { Hono } from 'hono'
import { getLatestScrape, getLatestOnePieceWithFiles } from './db/queries.js'

const app = new Hono()

app.get('/health', (c) => c.json({ status: 'ok' }))

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

app.onError((err, c) => {
  console.error(err)
  return c.json({ message: 'internal server error' }, 500)
})

export default app
