import { StatusCodes } from "http-status-codes"
import { taskModel } from "~/models/task.model"
import { userModel } from "~/models/user.model"
import ApiError from "~/utils/ApiError"

const create = async (data) => {
    const createNewTask = await taskModel.create(data)
    const newTask = await taskModel.findById(createNewTask.insertedId)
    const user = await userModel.findById(newTask.userId)
    return {
        ...newTask,
        userName : user.username
    }
}

const update = async (id,updateData) => {
    const updateTask = await taskModel.update(id,updateData)
    if (!updateTask){
          throw new ApiError(StatusCodes.NOT_FOUND,"Thất bại dữ liệu không tồn tại")
    }
    return updateTask
}

const getTaskByEmployeer = async (employeerId) => {
    const tasks = await taskModel.getTaskByEmployeer(employeerId)
    if (!tasks || tasks.length === 0){
        throw new ApiError(StatusCodes.NOT_FOUND,"Danh sách rỗng")
    }
    return tasks
}

const deleteTask = async (id) => {
    const res = await taskModel.deleteTask(id)
    if (res.deletedCount === 0){
        throw new ApiError(StatusCodes.NOT_FOUND,"Thất bại không tìm thấy")
    }
    return res
}
export const taskService = {
    create,update,
    getTaskByEmployeer,
    deleteTask
}