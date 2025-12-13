import { StatusCodes } from "http-status-codes"
import { taskModel } from "~/models/task.model"
import ApiError from "~/utils/ApiError"

const create = async (data) => {
    const createNewTask = await taskModel.create(data)
    const newTask = await taskModel.findById(createNewTask.insertedId)
    return newTask
}

const update = async (id,updateData) => {
    const updateTask = await taskModel.update(id,updateData)
    return updateTask
}

const getTaskByEmployeer = async (employeerId) => {
    const tasks = await taskModel.getTaskByEmployeer(employeerId)
    if (!tasks || tasks.length === 0){
        throw new ApiError(StatusCodes.NOT_FOUND,"Danh sách rỗng")
    }
    return tasks
}

export const taskService = {
    create,update,
    getTaskByEmployeer
}