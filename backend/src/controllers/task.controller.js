import { StatusCodes } from "http-status-codes";
import { taskService } from "~/services/task.service";

const create = async (req, res, next) => {
  try {
    const data = req.body;
    const result = await taskService.create(data);

    res.status(StatusCodes.CREATED).json({
      statusCode: StatusCodes.CREATED,
      message: "Thêm công việc thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await taskService.update(id, updateData);

    res.status(StatusCodes.CREATED).json({
      statusCode: StatusCodes.CREATED,
      message: "Chỉnh sửa thành thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getTaskByEmployeer = async (req, res, next) => {
  try {
    const { employeerId } = req.params;
    const result = await taskService.getTaskByEmployeer(employeerId);

    res.status(StatusCodes.CREATED).json({
      statusCode: StatusCodes.OK,
      message: "Lấy danh sách công việc thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await taskService.deleteTask(id);

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "Xoá thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const taskController = {
  create,
  update,
  getTaskByEmployeer,
  deleteTask
};
