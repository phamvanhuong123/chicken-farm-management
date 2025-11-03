/**
 * material.service.js
 * TEAM-102: Material Service (phân trang + lọc + tìm kiếm)
 */

import { materialModel } from '../models/material.model.js'

export const getAllMaterials = async (query) => {
  const {
    page = 1,
    limit = 10,
    keyword = '',
    type,
    sort = 'createdAt',
    order = 'desc'
  } = query

  const filters = {}

  // Tìm kiếm theo tên hoặc loại
  if (keyword) {
    filters.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { type: { $regex: keyword, $options: 'i' } }
    ]
  }

  //  Lọc theo loại
  if (type) filters.type = type

  // Phân trang
  const skip = (Number(page) - 1) * Number(limit)

  // Lấy danh sách vật tư & tổng số
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
