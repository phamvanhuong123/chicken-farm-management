import express from 'express'
const router = express.Router()

router.get('/status', async(req, res) => {
  res.json({
    data : 'ok'
  })
})
export const APIs_V1 = router