import { flockService } from "../services/flock.service.js";

export const createFlock = async (req, res, next) => {
  console.log("📨 API /flocks POST được gọi"); // THÊM LOG
  console.log("📨 Body:", req.body); // THÊM LOG
  console.log("📨 Headers:", req.headers); // THÊM LOG
  try {
    const newFlock = await flockService.createFlock(req.body);
     console.log("✅ Tạo đàn thành công:", newFlock); // THÊM LOG
    res.status(201).json({
      message: "Tạo đàn mới thành công",
      data: newFlock,
      metadata: {
        areaUpdated: newFlock.areaUpdated || null
      }
    });
  } catch (error) {
    console.error("🔥 Lỗi trong controller:", error.message); // THÊM LOG
    console.error("🔥 Stack trace:", error.stack); // THÊM LOG
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
    const { flock } = await flockService.getFlockDetail(id);

    res.status(200).json({
      message: "Tải thông tin đàn thành công",
      data: {
        flock
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
/**
 * [DELETE] /v1/flocks/:id
 * TEAM-90: Xóa đàn gà theo ID
 */
export const deleteFlock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await flockService.deleteFlock(id);

    res.status(200).json({
      message: "Xóa đàn thành công.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
