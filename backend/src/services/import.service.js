/**
 * TEAM-122: Service Nhập Chuồng
 * - Xử lý tạo lứa nhập
 * - Cập nhật KPI tổng nhập tháng
 */

import { importModel } from "~/models/import.model.js";
import { analyticsService } from "~/services/analytics.service.js";

export const importService = {
  async createImport(data) {
    const newImport = await importModel.create(data);
    await analyticsService.updateMonthlyImport(newImport.quantity);

    return newImport;
  },

  async getImports(query) {
    return await importModel.getList(query);
  },
};
