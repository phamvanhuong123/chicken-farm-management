// File: src/routes/index.js

import express from 'express'
import flockRoute from './v1/flock.route.js'
import materialRoute from './v1/material.route.js'
const router = express.Router()

// route kiểm tra server
router.get('/status', (req, res) => {
  res.json({ data: 'ok' })
})

// nhóm route đàn gà
// nhóm route đàn gà (Chỉ định rõ prefix /flocks)
router.use('/flocks', flockRoute)
router.use('/materials', materialRoute)
export const APIs_V1 = router