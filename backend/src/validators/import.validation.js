/**
 * TEAM-122: Import Validation
 * - Kiểm tra dữ liệu form nhập chuồng
 * - Validate trường bắt buộc + format hợp lệ
 */

import Joi from "joi";

export const validateImportCreate = (req, res, next) => {
  const schema = Joi.object({
    date: Joi.date().required(),
    supplier: Joi.string().required(),
    speciesId: Joi.string().required(),
    quantity: Joi.number().integer().min(1).required(),
    avgWeight: Joi.number().min(0).required(),
    areaId: Joi.string().required(),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      message: "Vui lòng điền đầy đủ và hợp lệ thông tin.",
      errors: error.details.map((e) => e.message),
    });
  }

  next();
};
