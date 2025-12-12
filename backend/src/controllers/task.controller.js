import { StatusCodes } from "http-status-codes";
import { taskService } from "~/services/task.service";

const create = async (req, res, next) => {
  try {
    const data  = req.body
    const result = await taskService.create(data)
    

    res.status(StatusCodes.CREATED).json({
        statusCode : StatusCodes.CREATED,
        message : "Thêm công việc thành công",
        data : result
    })
  } catch (error) {
    next(error);
  }
};


export const taskController = {
    create
}