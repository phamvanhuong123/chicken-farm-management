/**
 * TEAM-102: Material Service (phân trang + lọc + import Excel)
 */
import ExcelJS from 'exceljs'
import fs from 'fs'
import { materialModel } from '~/models/material.model.js'

const getAllMaterials = async (query) => {
  const {
    page = 1,
    limit = 10,
    keyword = '',
    type,
    sort = 'createdAt',
    order = 'desc'
  } = query

  const filters = {}

  if (keyword) {
    filters.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { type: { $regex: keyword, $options: 'i' } }
    ]
  }

  if (type) filters.type = type

  const skip = (Number(page) - 1) * Number(limit)

  const items = await materialModel.findAll(filters, sort, order, skip, Number(limit))
  const totalItems = await materialModel.count(filters)
  const totalPages = Math.ceil(totalItems / limit)

  return {
    items,
    totalItems,
    totalPages,
    currentPage: Number(page)
  }
}

/**
 * Nhập vật tư từ file Excel (.xlsx)
 */
const importFromExcel = async (filePath) => {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(filePath)
  const sheet = workbook.worksheets[0]

  const errors = []
  let successCount = 0

  const existing = await materialModel.findAll()
  const existingNames = new Set(existing.map(m => m.name.toLowerCase()))

  for (let i = 2; i <= sheet.rowCount; i++) {
    const row = sheet.getRow(i)
    const [name, type, quantity, unit, expiryDate, threshold, storageLocation] = row.values.slice(1)

    if (!name || !type || !quantity || !unit || !expiryDate || !threshold || !storageLocation) {
      errors.push({ row: i, message: 'Thiếu dữ liệu bắt buộc.' })
      continue
    }

    if (existingNames.has(name.toLowerCase())) {
      errors.push({ row: i, message: `Vật tư '${name}' đã tồn tại.` })
      continue
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
      updatedAt: null
    }

    try {
      await materialModel.create(data)
      successCount++
      existingNames.add(name.toLowerCase())
    } catch (err) {
      errors.push({ row: i, message: err.message })
    }
  }

  fs.unlinkSync(filePath) // xoá file sau khi đọc

  return { successCount, totalRows: sheet.rowCount - 1, errors }
}

export const materialService = { getAllMaterials, importFromExcel }
