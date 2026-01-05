import express from 'express'
import { taskController } from '~/controllers/task.controller'
import { authorize } from '~/middlewares/authorizeMiddleware'
import { ROLE } from '~/utils/constants'
import { taskValidate } from '~/validators/task.validate'
const route = express.Router()


//THêm công việc

route.post("/",authorize(ROLE.EMPLOYER), taskValidate.create, taskController.create)

route.put("/:id", taskValidate.update, taskController.update)

route.delete("/:id",authorize(ROLE.EMPLOYER), taskController.deleteTask)
// Lấy danh sách công việc theo employeerId
route.get("/:employeerId", taskController.getTaskByEmployeer)

export const taskRoute = route