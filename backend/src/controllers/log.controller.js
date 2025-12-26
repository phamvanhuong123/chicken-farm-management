import { logService } from "../services/log.service.js";

/**
 * [POST] /v1/logs
 * Tạo nhật ký mới
 */
export const createLog = async (req, res, next) => {
  try {
    const newLog = await logService.createLog(req.body);
    res.status(201).json({
      message: "Tạo nhật ký thành công",
      data: newLog,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * [PUT] /v1/logs/:id
 * Cập nhật nhật ký
 */
export const updateLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedLog = await logService.updateLog(id, updateData);

    res.status(200).json({
      message: "Cập nhật nhật ký thành công",
      data: updatedLog,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * [GET] /v1/logs/:id
 * Xem chi tiết nhật ký
 */
export const getLogDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const log = await logService.getLogById(id);

    res.status(200).json({
      message: "Lấy chi tiết nhật ký thành công",
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * [GET] /v1/logs
 * Lấy danh sách nhật ký (hỗ trợ filter ?flockId=...)
 */
export const getAllLogs = async (req, res, next) => {
  try {
    const { flockId } = req.query;
    let logs;

    if (flockId) {
      logs = await logService.getLogsByFlockId(flockId);
    } else {
      logs = await logService.getAllLogs();
    }

    res.status(200).json({
      message: "Lấy danh sách nhật ký thành công",
      data: logs,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(200).json({
        message: "Chưa có dữ liệu nhật ký.",
        data: [],
      });
    }
    next(error);
  }
};

/**
 * [DELETE] /v1/logs/:id
 * Xóa nhật ký
 */
export const deleteLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await logService.deleteLog(id);

    res.status(200).json({
      message: "Xóa nhật ký thành công.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};