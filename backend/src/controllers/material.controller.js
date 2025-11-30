/**
 * TEAM-102: Material Controller (phân trang, lọc, import/export Excel)
 */

import ExcelJS from "exceljs";
import fs from "fs";
import { materialService } from "~/services/material.service.js";

/**
 * [GET] /v1/materials
 *  - export=true → Xuất file Excel
 */
export const getAllMaterials = async (req, res, next) => {
  try {
    const exportExcel = req.query.export === "true" || req.query.export === "1";
    const result = await materialService.getAllMaterials(req.query);
    const { items, totalItems, totalPages, currentPage } = result;

    if (exportExcel) {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Danh sách vật tư");

      sheet.columns = [
        { header: "Tên vật tư", key: "name", width: 30 },
        { header: "Loại", key: "type", width: 20 },
        { header: "Số lượng tồn", key: "quantity", width: 15 },
        { header: "Đơn vị", key: "unit", width: 12 },
        { header: "Hạn sử dụng", key: "expiryDate", width: 18 },
        { header: "Ngưỡng cảnh báo", key: "threshold", width: 18 },
        { header: "Vị trí lưu trữ", key: "storageLocation", width: 20 },
        { header: "Trạng thái", key: "status", width: 18 },
      ];

      items.forEach((m) => {
        const label = m.statusInfo?.label || "Bình thường";
        const color = m.statusInfo?.color || "";
        const row = sheet.addRow({
          name: m.name,
          type: m.type,
          quantity: m.quantity,
          unit: m.unit,
          expiryDate: new Date(m.expiryDate).toLocaleDateString("vi-VN"),
          threshold: m.threshold,
          storageLocation: m.storageLocation,
          status: label,
        });
        if (color === "red")
          row.getCell("status").font = { color: { argb: "FF0000" } };
        if (color === "orange")
          row.getCell("status").font = { color: { argb: "FFA500" } };
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="materials.xlsx"'
      );
      await workbook.xlsx.write(res);
      res.end();
      return;
    }

    // Không có dữ liệu
    if (!items?.length) {
      return res.status(200).json({
        message: "Chưa có dữ liệu vật tư.",
        data: { totalItems: 0, totalPages: 0, currentPage, items: [] },
      });
    }

    res.status(200).json({
      message: "Tải danh sách vật tư thành công",
      data: { totalItems, totalPages, currentPage, items },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * [POST] /v1/materials/import
 * Nhập vật tư từ file Excel
 */
export const importExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Vui lòng chọn file Excel để nhập." });
    }

    const result = await materialService.importFromExcel(req.file.path);
    res.status(200).json({
      message: `Đã nhập ${result.successCount} / ${result.totalRows} dòng thành công.`,
      errors: result.errors,
    });
  } catch (error) {
    next(error);
  }
};
/**
 * TEAM-104: [GET] /v1/materials/:id
 * Xem chi tiết vật tư + lịch sử nhập
 */
export const getMaterialById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const material = await materialService.getMaterialById(id);
    if (!material) {
      return res.status(404).json({
        statusCode: 404,
        message: "Không tìm thấy thông tin vật tư",
      });
    }

    res.status(200).json({
      statusCode: 200,
      message: "Lấy chi tiết vật tư thành công",
      data: material,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * [POST] /v1/materials
 * Thêm vật tư mới
 */
export const createMaterial = async (req, res, next) => {
  try {
    const newMaterial = await materialService.createMaterial(req.body);
    
    res.status(201).json({
      statusCode: 201,
      message: "Thêm vật tư thành công.",
      data: newMaterial,
    });
  } catch (error) {
    next(error);
  }
};
