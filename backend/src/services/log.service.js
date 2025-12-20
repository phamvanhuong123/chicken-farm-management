import { areaModel } from "~/models/area.model.js";
import { logModel } from "../models/log.model.js";
import { userModel } from "~/models/user.model.js";
import ApiError from "~/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { ObjectId } from "mongodb";

const createLog = async (data) => {
  try {
    // Kiểm tra khu nuôi có tồn tại hay ko
    const isArea = await areaModel.findById(data.areaId);
    if (!isArea) throw new Error("ID khu nuôi không tồn tại");

    // Kiểm tra xem người dùng có tồn tại
    const isUser = await userModel.findById(data.userId);
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

    const log = await logModel.findOneById(id);

    if (!log || log.userId?.toString() !== updateData.userId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Không hợp lệ bạn không có quyền chỉnh sửa"
      );
    }

    // Kiểm tra xem người dùng có tồn tại
    const isUser = await userModel.findById(updateData.userId);
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

/**
 * Lấy nhật ký theo flockId (đã đổi tên thành areaId)
 */
const getLogsByFlockId = async (flockId) => {
  try {
    const logs = await logModel.findByAreaId(flockId);
    if (!logs || logs.length === 0) {
      const err = new Error("Chưa có dữ liệu nhật ký cho đàn này.");
      err.statusCode = 404;
      throw err;
    }
    return logs;
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    error.message = "Không thể lấy nhật ký theo đàn: " + error.message;
    throw error;
  }
};

/**
 * Lấy tổng số lượng theo loại log trong khoảng thời gian (cho dashboard)
 */
const getTotalQuantityByTypeAndPeriod = async (type, startDate, endDate) => {
  try {
    const total = await logModel.getTotalQuantityByTypeAndTimeRange(
      type,
      startDate,
      endDate
    );
    return total;
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    error.message =
      "Không thể lấy tổng số lượng theo loại và thời gian: " + error.message;
    throw error;
  }
};

/**
 * Lấy dữ liệu biểu đồ theo thời gian
 */
const getTrendDataForDashboard = async (chartType, period) => {
  try {
    // Tính toán startDate dựa trên period
    const endDate = new Date();
    let startDate = new Date();

    switch (period) {
      case "24h":
        startDate.setDate(startDate.getDate() - 1);
        break;
      case "7d":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    const trendData = await logModel.getTrendData(
      chartType,
      startDate,
      endDate
    );
    return trendData;
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    error.message = "Không thể lấy dữ liệu biểu đồ: " + error.message;
    throw error;
  }
};

/**
 * Lấy cảnh báo từ log (cho dashboard)
 */
const getAlertsFromLogs = async () => {
  try {
    // Lấy log DEATH trong 7 ngày gần nhất
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const deathLogs = await logModel.getLogsByTypeAndTimeRange(
      "DEATH",
      startDate,
      endDate
    );

    const alerts = [];

    // Kiểm tra tỷ lệ chết cao
    if (deathLogs && deathLogs.length > 0) {
      const totalDeath = deathLogs.reduce(
        (sum, log) => sum + (log.quantity || 0),
        0
      );

      // Ngưỡng cảnh báo: nếu tổng số chết > 100
      if (totalDeath > 100) {
        alerts.push({
          type: "high_death_rate",
          title: "Tỷ lệ chết cao",
          message: `Có ${totalDeath} con gà chết trong 7 ngày qua. Cần kiểm tra sức khỏe đàn.`,
          severity: "high",
          timestamp: new Date().toISOString(),
          source: "log",
        });
      }
    }

    // Kiểm tra log sức khỏe (HEALTH) với ghi chú cảnh báo
    const healthLogs = await logModel.getLogsByTypeAndTimeRange(
      "HEALTH",
      startDate,
      endDate
    );

    if (healthLogs && healthLogs.length > 0) {
      const warningLogs = healthLogs.filter(
        (log) =>
          log.note &&
          (log.note.toLowerCase().includes("bệnh") ||
            log.note.toLowerCase().includes("ốm") ||
            log.note.toLowerCase().includes("cảnh báo"))
      );

      if (warningLogs.length > 0) {
        alerts.push({
          type: "health_warning",
          title: "Cảnh báo sức khỏe đàn",
          message: `Có ${warningLogs.length} ghi chú về vấn đề sức khỏe trong 7 ngày qua.`,
          severity: "medium",
          timestamp: new Date().toISOString(),
          source: "log",
        });
      }
    }

    return alerts;
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    error.message = "Không thể lấy cảnh báo từ nhật ký: " + error.message;
    throw error;
  }
};

/**
 * Lấy thống kê theo loại log
 */
const getLogStatistics = async (startDate, endDate) => {
  try {
    const stats = await logModel.getLogStatistics(startDate, endDate);
    return stats;
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    error.message = "Không thể lấy thống kê nhật ký: " + error.message;
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
  getLogsByFlockId,
  getTotalQuantityByTypeAndPeriod,
  getTrendDataForDashboard,
  getAlertsFromLogs,
  getLogStatistics,
  deleteLog,
};