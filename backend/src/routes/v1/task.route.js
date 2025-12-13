import express from 'express'
import { taskController } from '~/controllers/task.controller'
import { taskValidate } from '~/validators/task.validate'
const route = express.Router()


//THêm công việc

route.post("/",taskValidate.create,taskController.create)

route.put("/:id",taskValidate.update,taskController.update)
// Lấy danh sách công việc theo employeerId
route.get("/:employeerId",taskController.getTaskByEmployeer)
export const taskRoute = route