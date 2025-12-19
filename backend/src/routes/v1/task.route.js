import express from 'express'
import { taskController } from '~/controllers/task.controller'
import { taskValidate } from '~/validators/task.validate'
const router = express.Router()


//THêm công việc

router.post("/", taskValidate.create, taskController.create)

router.put("/:id", taskValidate.update, taskController.update)

router.delete("/:id", taskController.deleteTask)
// Lấy danh sách công việc theo employeerId
router.get("/:employeerId", taskController.getTaskByEmployeer)

export default router