import { flockModel } from "../models/flock.model.js";
import { areaModel, AREA_STATUS } from "../models/area.model.js"; // THÊM DÒNG NÀY
import { ObjectId } from "mongodb";

const createFlock = async (data) => {
  console.log("Data nhận được:", data);
  try {
    // THÊM PHẦN NÀY: Cập nhật khu nuôi trước khi tạo đàn
    const { areaId, initialCount } = data;
    
    if (areaId && initialCount) {
      console.log("Bắt đầu cập nhật khu nuôi:", { areaId, initialCount });
      
      // Kiểm tra ID hợp lệ
      if (ObjectId.isValid(areaId)) {
        const area = await areaModel.findById(areaId);
        
        if (area) {
          const currentCapacity = area.currentCapacity || 0;
          const newCurrentCapacity = currentCapacity + Number(initialCount);
          
          console.log("Thông tin khu nuôi:", {
            currentCapacity,
            maxCapacity: area.maxCapacity,
            newCurrentCapacity
          });
          
          // Kiểm tra sức chứa
          if (newCurrentCapacity <= area.maxCapacity) {
            // Chuẩn bị dữ liệu cập nhật
            const updateData = {
              currentCapacity: newCurrentCapacity,
              updatedAt: new Date()
            };
            
            // Chuyển trạng thái nếu đang trống
            if (area.status === AREA_STATUS.EMPTY) {
              updateData.status = AREA_STATUS.ACTIVE;
            }
            
            // Cập nhật khu nuôi
            await areaModel.update(areaId, updateData);
            console.log("Đã cập nhật khu nuôi thành công");
          } else {
            console.warn("Khu nuôi không đủ sức chứa, vẫn tạo đàn nhưng không cập nhật khu");
          }
        } else {
          console.warn("Không tìm thấy khu nuôi, vẫn tạo đàn bình thường");
        }
      } else {
        console.warn("ID khu nuôi không hợp lệ, vẫn tạo đàn bình thường");
      }
    }
    // KẾT THÚC PHẦN THÊM
    const createdFlock = await flockModel.create(data);
    return createdFlock;
  } catch (error) {
    if (error.statusCode) throw error;

    const err = new Error("Không thể lưu thông tin đàn: " + error.message);
    err.statusCode = 500;
    throw err;
  }
};
/**
 * Lấy chi tiết 1 đàn theo ID
 */
const getFlockOnly = async (id) => {
  const flock = await flockModel.findOneById(id);
  if (!flock) {
    const err = new Error("Không tìm thấy đàn");
    err.statusCode = 404;
    throw err;
  }
  return flock;
};

/**
 * Cập nhật thông tin đàn
 */
const updateFlock = async (id, updateData) => {
  try {
    await flockModel.validateBeforeUpdate(updateData);
    await flockModel.update(id, updateData);
    const updatedFlock = await flockModel.findOneById(id);
    return updatedFlock;
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy chi tiết đàn và nhật ký liên quan
 * TEAM-93
 */
const getFlockDetail = async (id) => {
  try {
    const result = await flockModel.findDetailById(id);
    return result;
  } catch (error) {
    throw error;
  }
};
/**
 * TEAM-81: Lấy danh sách đàn
 */
const getAllFlocks = async () => {
  try {
    const flocks = await flockModel.getAllFlocks();
    if (!flocks || flocks.length === 0) {
      const err = new Error("Chưa có dữ liệu đàn gà.");
      err.statusCode = 404;
      throw err;
    }
    return flocks;
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    error.message = "Không thể tải danh sách đàn: " + error.message;
    throw error;
  }
};

/**
 * TEAM-90: Xóa đàn
 */
const deleteFlock = async (id) => {
  try {
    const flock = await flockModel.findOneById(id);
    if (!flock) {
      const err = new Error("Không tìm thấy đàn.");
      err.statusCode = 404;
      throw err;
    }

    // Không cho xóa đàn đang nuôi
    const status = (flock.status || "").toLowerCase();
    if (
      status.includes("raising") ||
      status.includes("đang nuôi") ||
      status.includes("dang nuoi")
    ) {
      const err = new Error(
        "Không thể xóa đàn đang nuôi. Vui lòng hoàn tất xuất chuồng trước khi xóa."
      );
      err.statusCode = 400;
      throw err;
    }

    // Xóa đàn
    const result = await flockModel.deleteById(id);
    return result;
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = "Không thể xóa đàn, vui lòng thử lại. " + error.message;
    }
    throw error;
  }
};

export const flockService = {
  getFlockOnly,
  updateFlock,
  getFlockDetail,
  createFlock,
  getAllFlocks,
  deleteFlock,
};
