import { importService } from "~/services/import.service.js";
import Joi from "joi";
/**
 * [GET] /v1/imports
 * Danh sách lứa nhập (phân trang)
 */
export const getImportList = async (req, res, next) => {
  try {
    const result = await importService.getImports(req.query);

    return res.status(200).json({
      message: "Tải danh sách nhập chuồng thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
/**
 * [POST] /v1/imports
 * Thêm lứa nhập mới
 */
export const createImport = async (req, res, next) => {
  try {
    const schema = Joi.object({
      importDate: Joi.date().required(),
      supplier: Joi.string().required(),
      breed: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
      avgWeight: Joi.number().min(0.1).required(),
      barn: Joi.string().required(),
    });

    const body = await schema.validateAsync(req.body, {
      abortEarly: false,
    });

    const newImport = await importService.createImport(body);

    return res.status(201).json({
      message: "Thêm lứa nhập chuồng thành công.",
      data: newImport,
    });
  } catch (error) {
    if (error?.isJoi)
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ và hợp lệ thông tin." });

    return res
      .status(500)
      .json({ message: "Không thể lưu, vui lòng thử lại sau." });
  }
};
// GET DETAIL
export const getImportDetail = async (req, res) => {
  try {
    const data = await importService.getImport(req.params.id);
    if (!data)
      return res.status(404).json({ message: "Không tìm thấy đơn nhập." });

    return res.status(200).json({
      message: "Tải dữ liệu thành công.",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Thao tác không thành công, vui lòng thử lại.",
    });
  }
};
/**
 * [PUT] /v1/imports/:id
 * Cập nhật lứa nhập
 */
export const updateImport = async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await importService.updateImport(id, req.body);

    if (!updated)
      return res.status(404).json({ message: "Không tìm thấy đơn nhập." });

    return res.status(200).json({
      message: "Cập nhật đơn thành công.",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Thao tác không thành công, vui lòng thử lại.",
    });
  }
};
/**
 * [DELETE] /v1/imports/:id
 * Xóa lứa nhập
 */
export const deleteImport = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await importService.deleteImport(id);

    if (!deleted)
      return res.status(404).json({ message: "Không tìm thấy đơn nhập." });

    return res.status(200).json({
      message: "Xóa đơn thành công.",
      data: deleted,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Thao tác không thành công, vui lòng thử lại.",
    });
  }
};