import { importModel } from "~/models/import.model.js";
import { flockModel } from "~/models/flock.model.js";
import { analyticsService } from "~/services/analytics.service.js";
import { capacityService } from "~/services/capacity.service.js";
import { GET_DB } from "~/config/mongodb.js";
import { ObjectId } from "mongodb";

export const importService = {
  async createImport(data) {
    // Kiểm tra sức chứa trước khi tạo
    const capacityCheck = await capacityService.checkAreaCapacity(
      data.barn,
      data.quantity
    );

    if (!capacityCheck.isValid) {
      const error = new Error(
        `Khu nuôi ${data.barn} không đủ sức chứa. ` +
        `Hiện tại: ${capacityCheck.currentCapacity}/${capacityCheck.maxCapacity}, ` +
        `Còn trống: ${capacityCheck.remainingCapacity}`
      );
      error.statusCode = 400;
      throw error;
    }

    // Tạo import trước
    const newImport = await importModel.create(data);

    // TẠO FLOCK TƯƠNG ỨNG
    try {
      const flockData = {
        initialCount: data.quantity,
        speciesId: data.breed,
        areaId: data.barn,
        ownerId: "system",
        avgWeight: data.avgWeight,
        status: data.status === "Đang nuôi" ? "Raising" : "Closed",
        currentCount: data.quantity,
        note: `Nhập chuồng từ ${data.supplier} - Import: ${newImport._id}`,
      };

      const createdFlock = await flockModel.create(flockData);

      // Cập nhật flockId vào import
      await importModel.update(newImport._id, {
        flockId: createdFlock._id.toString()
      });

      // Cập nhật import object để trả về
      newImport.flockId = createdFlock._id.toString();
    } catch (flockError) {
      console.error("Lỗi khi tạo flock:", flockError);
      // Nếu tạo flock thất bại, vẫn tiếp tục xử lý import
    }

    // Cập nhật dung lượng khu nuôi: GIẢM dung lượng (vì thêm gà)
    await capacityService.updateAreaCapacityQuick(data.barn, data.quantity);

    await analyticsService.updateMonthlyImport(newImport.quantity);
    return newImport;
  },

  async getImports(query) {
    return await importModel.getList(query);
  },

  async getImport(id) {
    return await importModel.findById(id);
  },

  async updateImport(id, data) {
    // Lấy thông tin cũ trước khi cập nhật
    const oldImport = await importModel.findById(id);
    if (!oldImport) {
      return null;
    }

    // Kiểm tra sức chứa nếu có thay đổi khu nuôi hoặc số lượng
    if (data.barn !== oldImport.barn || data.quantity !== oldImport.quantity) {
      const newBarn = data.barn || oldImport.barn;
      const newQuantity = data.quantity || oldImport.quantity;

      const capacityCheck = await capacityService.checkAreaCapacity(
        newBarn,
        newQuantity,
        id
      );

      if (!capacityCheck.isValid) {
        const error = new Error(
          `Khu nuôi ${newBarn} không đủ sức chứa. ` +
          `Hiện tại: ${capacityCheck.currentCapacity}/${capacityCheck.maxCapacity}, ` +
          `Còn trống: ${capacityCheck.remainingCapacity}`
        );
        error.statusCode = 400;
        throw error;
      }
    }

    const updated = await importModel.update(id, data);

    if (updated) {
      // XỬ LÝ CẬP NHẬT DUNG LƯỢNG KHI CHUYỂN KHU/THAY ĐỔI SỐ LƯỢNG
      const oldBarn = oldImport.barn;
      const newBarn = data.barn || oldBarn;
      const oldQuantity = oldImport.quantity;
      const newQuantity = data.quantity || oldQuantity;
      const oldStatus = oldImport.status;
      const newStatus = data.status || oldStatus;

      // Xử lý theo trạng thái
      if (oldStatus === "Đang nuôi" && newStatus === "Đang nuôi") {
        // Cùng trạng thái đang nuôi
        if (newBarn !== oldBarn) {
          // CHUYỂN KHU NUÔI
          // Khu cũ: TĂNG dung lượng (vì bớt gà)
          await capacityService.updateAreaCapacityQuick(oldBarn, -oldQuantity);
          // Khu mới: GIẢM dung lượng (vì thêm gà)
          await capacityService.updateAreaCapacityQuick(newBarn, newQuantity);
        } else {
          // CÙNG KHU NUÔI, THAY ĐỔI SỐ LƯỢNG
          if (oldQuantity !== newQuantity) {
            const quantityDiff = newQuantity - oldQuantity;
            await capacityService.updateAreaCapacityQuick(oldBarn, quantityDiff);
          }
        }
      } else if (oldStatus === "Đang nuôi" && newStatus !== "Đang nuôi") {
        // Từ "Đang nuôi" sang khác: TĂNG dung lượng khu cũ (vì bớt gà)
        await capacityService.updateAreaCapacityQuick(oldBarn, -oldQuantity);
      } else if (oldStatus !== "Đang nuôi" && newStatus === "Đang nuôi") {
        // Từ khác sang "Đang nuôi": GIẢM dung lượng khu (vì thêm gà)
        await capacityService.updateAreaCapacityQuick(newBarn, newQuantity);
      }

      // CẬP NHẬT FLOCK TƯƠNG ỨNG
      if (oldImport.flockId) {
        try {
          const flockUpdateData = {
            speciesId: data.breed || oldImport.breed,
            areaId: newBarn,
            avgWeight: data.avgWeight || oldImport.avgWeight,
            currentCount: newQuantity,
            initialCount: newQuantity,
            status: newStatus === "Đang nuôi" ? "Raising" : "Closed",
            note: `Cập nhật từ import ${id} - ${new Date().toLocaleDateString('vi-VN')}`,
          };

          await flockModel.update(oldImport.flockId, flockUpdateData);
        } catch (flockError) {
          console.error("Lỗi khi cập nhật flock:", flockError);
        }
      }
    }

    return updated;
  },
  async deleteImport(id) {
    try {
      // 1. Lấy thông tin import trước khi xóa
      const importData = await importModel.findById(id);
      if (!importData) {
        return null;
      }

      // 2. Xử lý flock tương ứng
      if (importData.flockId) {
        try {
          const flock = await GET_DB()
            .collection('flocks')
            .findOne({ _id: new ObjectId(importData.flockId) });

          if (flock) {
            const status = (flock.status || "").toLowerCase();
            const isRaising = status.includes("raising") ||
              status.includes("đang nuôi") ||
              status.includes("dang nuoi");

            if (isRaising) {
              // Đóng flock thay vì xóa
              await GET_DB()
                .collection('flocks')
                .updateOne(
                  { _id: new ObjectId(importData.flockId) },
                  {
                    $set: {
                      status: "Closed",
                      currentCount: 0,
                      updatedAt: new Date()
                    }
                  }
                );
            } else {
              // Xóa flock nếu không ở trạng thái nuôi
              await GET_DB()
                .collection('flocks')
                .deleteOne({ _id: new ObjectId(importData.flockId) });
            }
          }
        } catch (flockErr) {
          console.error("Lỗi khi xử lý flock:", flockErr);
        }
      }

      // 3. Xóa import
      const deleted = await importModel.delete(id);

      // 4. Cập nhật dung lượng khu nuôi: TĂNG dung lượng (vì xóa gà)
      // Chỉ cập nhật nếu import đang ở trạng thái "Đang nuôi"
      if (importData.status === "Đang nuôi") {
        // Sử dụng updateAreaCapacityQuick với số âm để tăng dung lượng
        await capacityService.updateAreaCapacityQuick(importData.barn, -importData.quantity);
      }

      // 5. Cập nhật analytics
      await analyticsService.updateMonthlyImport(-importData.quantity);

      // Trả về dữ liệu đã xóa
      return deleted || importData;
    } catch (error) {
      console.error("Lỗi khi xóa import:", error);
      throw error;
    }
  },
};