
const store = new Map()

export const rateLimiter = (opts = {}) => {
  const windowMs = opts.windowMs || 60 * 1000 // 1 minute
  const max = opts.max || 5

  return (req, res, next) => {
    try {
      const key = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
      const now = Date.now()
      const entry = store.get(key) || { count: 0, start: now }

      if (now - entry.start > windowMs) {
        entry.count = 1
        entry.start = now
      } else {
        entry.count += 1
      }

      store.set(key, entry)

      if (entry.count > max) {
        res.status(429).json({ message: 'Too many requests, please try again later.' })
        return
      }

      next()
    } catch (err) {
      next()
    }
  }
}

setInterval(() => {
  const now = Date.now()
  const ttl = 5 * 60 * 1000 
  for (const [key, entry] of store.entries()) {
    if (now - entry.start > ttl) store.delete(key)
  }
}, 60 * 1000)

export default rateLimiter
