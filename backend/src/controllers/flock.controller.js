import { flockService } from "../services/flock.service.js";
import { GET_DB } from "~/config/mongodb.js"; 
import { ObjectId } from "mongodb"; 

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
/**
 * [DELETE] /v1/flocks/by-import/:importId
 * Xóa flock theo importId (dùng khi xóa import)
 */
export const deleteFlockByImport = async (req, res, next) => {
  try {
    const { importId } = req.params;

    // Tìm import để lấy flockId
    const importItem = await GET_DB()
      .collection('imports')
      .findOne({ _id: new ObjectId(importId) });

    if (!importItem) {
      return res.status(404).json({
        message: "Không tìm thấy import"
      });
    }

    const flockId = importItem.flockId;
    if (!flockId) {
      return res.status(200).json({
        message: "Import không có flock tương ứng"
      });
    }

    // Kiểm tra flock có tồn tại không
    const flock = await GET_DB()
      .collection('flocks')
      .findOne({ _id: new ObjectId(flockId) });

    if (!flock) {
      return res.status(200).json({
        message: "Flock đã được xóa trước đó"
      });
    }

    // Kiểm tra trạng thái flock
    const status = (flock.status || "").toLowerCase();
    const isRaising = status.includes("raising") ||
      status.includes("đang nuôi") ||
      status.includes("dang nuoi");

    if (isRaising) {
      // Đóng flock thay vì xóa
      await GET_DB()
        .collection('flocks')
        .updateOne(
          { _id: new ObjectId(flockId) },
          {
            $set: {
              status: "Closed",
              currentCount: 0,
              updatedAt: new Date()
            }
          }
        );

      return res.status(200).json({
        message: "Đã đóng flock (thay vì xóa) vì đang ở trạng thái nuôi"
      });
    } else {
      // Xóa flock
      await GET_DB()
        .collection('flocks')
        .deleteOne({ _id: new ObjectId(flockId) });

      return res.status(200).json({
        message: "Đã xóa flock thành công"
      });
    }
  } catch (error) {
    console.error("Lỗi khi xóa flock by import:", error);
    return res.status(500).json({
      message: "Lỗi khi xử lý flock"
    });
  }
};
