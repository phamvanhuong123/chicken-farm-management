import express from 'express'
import flockRoute from './v1/flock.route.js'

const router = express.Router()

// route kiểm tra server
router.get('/status', (req, res) => {
  res.json({ data: 'ok' })
})

// nhóm route đàn gà
router.use('/flocks', flockRoute)

export const APIs_V1 = router