/* eslint-disable no-console*/

import express from 'express'

import cors from 'cors'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSED_DB } from '~/config/mongodb'
import { APIs_V1 } from '~/routes/index'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'
import { env } from './config/environment'
import { corsOptions } from './config/cors'

const START_SERVER = () => {
  const app = express()
  // xu li cors
  app.use(cors(corsOptions))
  const port = 8071
  // enable req.body json data
  app.use(express.json())
  //use api/v1
  app.use('/v1', APIs_V1)
  // middleware xử lí lỗi tập trung
  app.use(errorHandlingMiddleware)

  if (env.BUILD_MODE === 'production') {
    app.listen(process.env.PORT, () => {
      console.log(`Listen production :http://localhost:${process.env.PORT}`)
    })
  }
  else {
    app.listen(port, () => {
      console.log(`Listen port :http://localhost:${port}`)
    })
  }
  // Thực hiện các tác vụ cleanup trước khi dừng server
  exitHook(() => {
    console.log('closed disconnected mongoDB alast')
    CLOSED_DB()
  })
}
(async() => {
  try {
    await CONNECT_DB()
    console.log('Connected mongoDB database')
    START_SERVER()
  }
  catch (error) {
    console.error(error)
    process.exit(0)
  }
})()

