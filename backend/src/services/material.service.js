import ExcelJS from "exceljs";
import fs from "fs";
import { materialModel } from "~/models/material.model.js";

const normalizeVietnamese = (str = "") => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
};

const getAllMaterials = async (query) => {
  const {
    page = 1,
    limit = 10,
    keyword = "",
    type,
    sort = "createdAt",
    order = "desc",
  } = query;

  const filters = {};

  if (keyword) {
    const normalizedKeyword = normalizeVietnamese(keyword);
    filters.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { normalizedName: { $regex: normalizedKeyword, $options: "i" } },
      { type: { $regex: keyword, $options: "i" } },
      { normalizedType: { $regex: normalizedKeyword, $options: "i" } },
    ];
  }

  if (type) filters.type = type;

  const skip = (Number(page) - 1) * Number(limit);
  const items = await materialModel.findAll(
    filters,
    sort,
    order,
    skip,
    Number(limit)
  );
  const totalItems = await materialModel.count(filters);
  const totalPages = Math.ceil(totalItems / limit);

  return { items, totalItems, totalPages, currentPage: Number(page) };
};

const importFromExcel = async (filePath) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];

  const errors = [];
  let successCount = 0;

  const existing = await materialModel.findAll();
  const existingNames = new Set(
    existing.map((m) => normalizeVietnamese(m.name))
  );

  for (let i = 2; i <= sheet.rowCount; i++) {
    const row = sheet.getRow(i);
    const [name, type, quantity, unit, expiryDate, threshold, storageLocation] =
      row.values.slice(1);

    if (
      !name ||
      !type ||
      !quantity ||
      !unit ||
      !expiryDate ||
      !threshold ||
      !storageLocation
    ) {
      errors.push({ row: i, message: "Thiếu dữ liệu bắt buộc." });
      continue;
    }

    const normalizedName = normalizeVietnamese(name);
    if (existingNames.has(normalizedName)) {
      errors.push({ row: i, message: `Vật tư '${name}' đã tồn tại.` });
      continue;
    }

    const data = {
      name: String(name).trim(),
      type: String(type).trim(),
      quantity: Number(quantity),
      unit: String(unit).trim(),
      expiryDate: new Date(expiryDate),
      threshold: Number(threshold),
      storageLocation: String(storageLocation).trim(),
      createdAt: new Date(),
      updatedAt: null,
    };

    try {
      await materialModel.create(data);
      successCount++;
      existingNames.add(normalizedName);
    } catch (err) {
      errors.push({ row: i, message: err.message });
    }
  }

  fs.unlinkSync(filePath);
  return { successCount, totalRows: sheet.rowCount - 1, errors };
};

const getMaterialById = async (id) => {
  const material = await materialModel.findById(id);
  if (!material) return null;
  return material;
};

const createMaterial = async (data) => {
  const valid = await materialModel.validateBeforeCreateMaterial(data);
  const result = await materialModel.create(valid);

  return {
    _id: result.insertedId,
    ...valid,
  };
};

const getFeedInfoForDashboard = async () => {
  try {
    const filters = {
      $or: [
        { type: { $regex: 'feed', $options: 'i' } },
        { type: { $regex: 'thức ăn', $options: 'i' } },
        { normalizedType: { $regex: 'feed', $options: 'i' } },
        { normalizedType: { $regex: 'thuc an', $options: 'i' } }
      ]
    };

    const materials = await materialModel.findAll(filters, 'createdAt', 'desc', 0, 0);

    if (!materials || materials.length === 0) {
      return {
        source: 'fallback',
        value: 0,
        unit: 'kg',
        note: 'Không có dữ liệu thức ăn trong kho'
      };
    }

    const totalQuantity = materials.reduce((sum, material) => {
      return sum + (material.quantity || 0);
    }, 0);

    const unit = materials[0]?.unit || 'kg';

    let status = 'normal';
    let label = 'Bình thường';

    if (totalQuantity <= 500) {
      status = 'low';
      label = 'Thiếu';
    } else if (totalQuantity >= 1200) {
      status = 'high';
      label = 'Dư thừa';
    }

    return {
      source: 'material_service',
      value: totalQuantity,
      unit: unit,
      status: status,
      label: label,
      threshold: {
        LOW: 500,
        NORMAL: 800,
        HIGH: 1200
      },
      change: 0,
      materialCount: materials.length,
      items: materials.map(m => ({
        name: m.name,
        quantity: m.quantity,
        unit: m.unit,
        expiryDate: m.expiryDate,
        storageLocation: m.storageLocation
      }))
    };
  } catch (error) {
    console.error('Material Service - getFeedInfoForDashboard error:', error);
    return { source: 'fallback' };
  }
};

export const materialService = {
  getAllMaterials,
  importFromExcel,
  getMaterialById,
  createMaterial,
  getFeedInfoForDashboard,
};