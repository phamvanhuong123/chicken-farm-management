
import { areaModel } from "~/models/area.model.js";
import { logModel } from "../models/log.model.js";
import { userModel } from "~/models/user.model.js";
import ApiError from "~/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { ObjectId } from "mongodb";
const createLog = async (data) => {
  try {
    //Kiểm tra khu nuôi có tồn tại hay ko
    const isArea = await areaModel.findById(data.areaId)
     if (!isArea) throw new Error("ID khu nuôi không tồn tại");

    //Kiểm tra xem người dùng có tồn tại
    const isUser = await userModel.findById(data.userId)
     if (!isUser) throw new Error("Người dùng không tồn tại");


    const createdLog = await logModel.create(data);
    return createdLog;
  } catch (error) {
    if (error.statusCode) throw error;
    const err = new Error("Không thể tạo nhật ký: " + error.message);
    err.statusCode = 500;
    throw err;
  }
};

const updateLog = async (id, updateData) => {
  try {
    
    await logModel.validateBeforeUpdate(updateData);

    const log = await logModel.findOneById(id)

    
    if (!log || log.userId?.toString() !== updateData.userId){
   

      throw new ApiError(StatusCodes.BAD_REQUEST, "Không hợp lệ bạn không có quyền chỉnh sửa")
    }
    

    //Kiểm tra xem người dùng có tồn tại
    const isUser = await userModel.findById(updateData.userId)
     if (!isUser) throw new Error("Người dùng không tồn tại");
    const updatedLog = await logModel.update(id, updateData);
    
    return updatedLog;
  } catch (error) {
    throw error;
  }
};

const getLogById = async (id) => {
  const log = await logModel.findOneById(id);
  if (!log) {
    const err = new Error("Không tìm thấy nhật ký");
    err.statusCode = 404;
    throw err;
  }
  return log;
};

/**
 * Lấy tất cả nhật ký
 */
const getAllLogs = async () => {
  try {
    const logs = await logModel.getAllLogs();
    if (!logs || logs.length === 0) {
      const err = new Error("Chưa có dữ liệu nhật ký.");
      err.statusCode = 404;
      throw err;
    }
    return logs;
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    error.message = "Không thể tải danh sách nhật ký: " + error.message;
    throw error;
  }
};


const deleteLog = async (id) => {
  try {
    const log = await logModel.findOneById(id);
    if (!log) {
      const err = new Error("Không tìm thấy nhật ký để xóa.");
      err.statusCode = 404;
      throw err;
    }

    const result = await logModel.deleteById(id);
    return result;
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    throw error;
  }
};

export const logService = {
  createLog,
  updateLog,
  getLogById,
  getAllLogs,
 
  deleteLog,
};