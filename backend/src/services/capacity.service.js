import { GET_DB } from "~/config/mongodb.js";
import { ObjectId } from "mongodb";

export const capacityService = {
    /**
     * Tính tổng số lượng gà đang nuôi trong một khu
     */
    async getCurrentCapacityInArea(areaName) {
        try {
            // Lấy tất cả imports có status "Đang nuôi" trong khu này
            const imports = await GET_DB()
                .collection('imports')
                .find({
                    barn: areaName,
                    status: "Đang nuôi"
                })
                .toArray();

            const totalQuantity = imports.reduce((sum, imp) => sum + (imp.quantity || 0), 0);
            return totalQuantity;
        } catch (error) {
            console.error("Error calculating area capacity:", error);
            return 0;
        }
    },

    /**
     * Kiểm tra xem khu có đủ sức chứa cho số lượng mới không
     */
    async checkAreaCapacity(areaName, newQuantity, excludeImportId = null) {
        try {
            // Lấy thông tin khu nuôi
            const areas = await GET_DB()
                .collection('areas')
                .find({ name: areaName })
                .toArray();

            if (!areas || areas.length === 0) {
                throw new Error(`Không tìm thấy khu nuôi: ${areaName}`);
            }

            const area = areas[0];
            const maxCapacity = area.maxCapacity || 0;
            const currentCapacity = area.currentCapacity || 0; // Dung lượng còn trống

            // Tính số lượng có thể thêm = dung lượng hiện tại (còn trống)
            const remainingCapacity = currentCapacity;

            // Kiểm tra: số lượng mới không được vượt quá dung lượng còn trống
            const isValid = newQuantity <= remainingCapacity;

            return {
                isValid,
                currentCapacity: currentCapacity,
                maxCapacity,
                remainingCapacity: remainingCapacity
            };
        } catch (error) {
            console.error("Error checking area capacity:", error);
            throw error;
        }
    },

    /**
     * Cập nhật currentCapacity cho một khu nuôi (tính toán lại từ đầu)
     * currentCapacity = maxCapacity - tổng số gà đang nuôi trong khu
     */
    async updateAreaCurrentCapacity(areaName) {
        try {
            // Tính tổng số gà đang nuôi trong khu
            const pipeline = [
                {
                    $match: {
                        barn: areaName,
                        status: "Đang nuôi"
                    }
                },
                {
                    $group: {
                        _id: "$barn",
                        total: { $sum: "$quantity" }
                    }
                }
            ];

            const result = await GET_DB()
                .collection('imports')
                .aggregate(pipeline)
                .toArray();

            const totalChicken = result.length > 0 ? result[0].total : 0;

            // Tìm khu nuôi
            const areas = await GET_DB()
                .collection('areas')
                .find({ name: areaName })
                .toArray();

            if (!areas || areas.length === 0) {
                throw new Error(`Không tìm thấy khu nuôi: ${areaName}`);
            }

            const area = areas[0];
            const maxCapacity = area.maxCapacity || 0;

            // Tính dung lượng hiện tại (còn trống) = maxCapacity - tổng số gà
            const currentCapacity = maxCapacity - totalChicken;

            // Cập nhật
            await GET_DB()
                .collection('areas')
                .updateOne(
                    { _id: new ObjectId(area._id) },
                    {
                        $set: {
                            currentCapacity: Math.max(0, currentCapacity),
                            updatedAt: new Date()
                        }
                    }
                );

            return currentCapacity;
        } catch (error) {
            console.error("Error updating area capacity:", error);
            throw error;
        }
    },

    /**
     * Cập nhật dung lượng nhanh (dùng khi thêm/xóa/update import)
     * quantityChange: số lượng thay đổi (dương: thêm gà -> giảm dung lượng trống, âm: bớt gà -> tăng dung lượng trống)
     */
    async updateAreaCapacityQuick(areaName, quantityChange) {
        try {
            // Tìm khu nuôi
            const areas = await GET_DB()
                .collection('areas')
                .find({ name: areaName })
                .toArray();

            if (!areas || areas.length === 0) {
                throw new Error(`Không tìm thấy khu nuôi: ${areaName}`);
            }

            const area = areas[0];

            // Tính dung lượng mới: currentCapacity - quantityChange
            // quantityChange dương (thêm gà) -> dung lượng trống giảm
            // quantityChange âm (bớt gà) -> dung lượng trống tăng
            let newCapacity = (area.currentCapacity || 0) - quantityChange;

            // Đảm bảo không âm và không vượt quá maxCapacity
            newCapacity = Math.max(0, newCapacity);
            const maxCapacity = area.maxCapacity || 0;
            newCapacity = Math.min(newCapacity, maxCapacity);

            // Cập nhật
            await GET_DB()
                .collection('areas')
                .updateOne(
                    { _id: new ObjectId(area._id) },
                    {
                        $set: {
                            currentCapacity: newCapacity,
                            updatedAt: new Date()
                        }
                    }
                );

            return newCapacity;
        } catch (error) {
            console.error("Error updating area capacity quick:", error);
            throw error;
        }
    },

    /**
     * Lấy thông tin dung lượng khu nuôi
     */
    async getAreaCapacityInfo(areaName) {
        try {
            const areas = await GET_DB()
                .collection('areas')
                .find({ name: areaName })
                .toArray();

            if (!areas || areas.length === 0) {
                return null;
            }

            const area = areas[0];

            return {
                maxCapacity: area.maxCapacity || 0,
                currentCapacity: area.currentCapacity || 0, // Dung lượng còn trống
                currentCount: area.maxCapacity - (area.currentCapacity || 0) // Số gà hiện có
            };
        } catch (error) {
            console.error("Error getting area capacity info:", error);
            throw error;
        }
    }
};