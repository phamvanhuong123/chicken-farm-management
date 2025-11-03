/**
 * TEAM-102: Material Controller (phân trang, lọc, export Excel)
 */

import { materialService } from '../services/material.service.js'
import ExcelJS from 'exceljs'

/**
 * [GET] /v1/materials
 * Query params:
 *  - keyword: tìm theo tên hoặc loại
 *  - type: lọc theo loại
 *  - page, limit, sort, order: phân trang & sắp xếp
 *  - export=true: xuất Excel
 */
export const getAllMaterials = async (req, res, next) => {
  try {
    const exportExcel = req.query.export === 'true' || req.query.export === '1'
    const result = await materialService.getAllMaterials(req.query)
    const { items, totalItems, totalPages, currentPage } = result

    // Xuất Excel
    if (exportExcel) {
      const workbook = new ExcelJS.Workbook()
      const sheet = workbook.addWorksheet('Danh sách vật tư')

      sheet.columns = [
        { header: 'Tên vật tư', key: 'name', width: 30 },
        { header: 'Loại', key: 'type', width: 20 },
        { header: 'Số lượng tồn', key: 'quantity', width: 15 },
        { header: 'Đơn vị', key: 'unit', width: 12 },
        { header: 'Hạn sử dụng', key: 'expiryDate', width: 18 },
        { header: 'Ngưỡng cảnh báo', key: 'threshold', width: 18 },
        { header: 'Vị trí lưu trữ', key: 'storageLocation', width: 20 },
        { header: 'Trạng thái', key: 'status', width: 18 }
      ]

      items.forEach((m) => {
        const color = m.statusInfo?.color || ''
        const label = m.statusInfo?.label || 'Bình thường'
        const row = sheet.addRow({
          name: m.name,
          type: m.type,
          quantity: m.quantity,
          unit: m.unit,
          expiryDate: new Date(m.expiryDate).toLocaleDateString('vi-VN'),
          threshold: m.threshold,
          storageLocation: m.storageLocation,
          status: label
        })
        if (color === 'red') row.getCell('status').font = { color: { argb: 'FF0000' } }
        else if (color === 'orange') row.getCell('status').font = { color: { argb: 'FFA500' } }
      })

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
      res.setHeader('Content-Disposition', 'attachment; filename="materials.xlsx"')

      await workbook.xlsx.write(res)
      res.end()
      return
    }

    // Không có dữ liệu
    if (!items || items.length === 0) {
      return res.status(200).json({
        message: 'Chưa có dữ liệu vật tư.',
        data: { totalItems: 0, totalPages: 0, currentPage, items: [] }
      })
    }

    // Thành công
    res.status(200).json({
      message: 'Tải danh sách vật tư thành công',
      data: { totalItems, totalPages, currentPage, items }
    })
  } catch (error) {
    next(error)
  }
}
