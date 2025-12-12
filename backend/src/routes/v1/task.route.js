import express from 'express'
import { taskController } from '~/controllers/task.controller'
import { taskValidate } from '~/validators/task.validate'
const route = express.Router()


//THêm công việc

route.post("/",taskValidate.create,taskController.create)


export const taskRoute = route