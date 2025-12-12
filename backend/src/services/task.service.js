import { taskModel } from "~/models/task.model"

const create = async (data) => {
    const createNewTask = await taskModel.create(data)
    const newTask = await taskModel.findById(createNewTask.insertedId)
    return newTask
}

export const taskService = {
    create
}