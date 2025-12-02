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

  async getImport(id) {
    return await importModel.findById(id);
  },

  async updateImport(id, data) {
    return await importModel.update(id, data);
  },

  async deleteImport(id) {
    const deleted = await importModel.delete(id);

    if (deleted) {
      await analyticsService.updateMonthlyImport(-deleted.quantity);
    }
    return deleted;
  },
};