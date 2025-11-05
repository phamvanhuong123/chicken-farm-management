import { flockService } from "../services/flock.service.js";

/**
 * [POST] /v1/flocks
 * Lưu thông tin đàn mới
 */
export const createFlock = async (req, res, next) => {
  try {
    const newFlock = await flockService.createFlock(req.body);
    res.status(201).json({
      message: "Tạo đàn mới thành công",
      data: newFlock,
    });
  } catch (error) {
    next(error);
  }
};
/* [PUT] /v1/flocks/:id
 * Cập nhật thông tin đàn
 */
export const updateFlock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedFlock = await flockService.updateFlock(id, updateData);

    res.status(200).json({
      message: "Cập nhật thông tin đàn thành công",
      data: updatedFlock,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * [GET] /v1/flocks/:id
 * Xem chi tiết đàn và nhật ký liên quan
 */
export const getFlockDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { flock, logs } = await flockService.getFlockDetail(id);

    res.status(200).json({
      message: "Tải thông tin đàn thành công",
      data: {
        flock,
        logs: Array.isArray(logs) ? logs : [],
      },
    });
  } catch (error) {
    next(error);
  }
};
/**
 * [GET] /v1/flocks
 * TEAM-81: Lấy danh sách đàn
 */
export const getAllFlocks = async (req, res, next) => {
  try {
    const flocks = await flockService.getAllFlocks();

    res.status(200).json({
      message: "Lấy danh sách đàn thành công",
      data: flocks,
    });
  } catch (error) {
    // Nếu không có dữ liệu
    if (error.statusCode === 404) {
      return res.status(200).json({
        message: "Chưa có dữ liệu đàn gà.",
        data: [],
      });
    }
    next(error);
  }
};
