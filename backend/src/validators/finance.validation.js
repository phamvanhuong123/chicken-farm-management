import Joi from "joi";
import { TRANSACTION_CATEGORIES } from "../models/financial-transaction.model.js";

/**
 * Validation cho việc tạo giao dịch mới
 */
const createTransactionSchema = Joi.object({
  date: Joi.date().required().messages({
    "any.required": "Ngày giao dịch là bắt buộc",
    "date.base": "Ngày giao dịch không hợp lệ"
  }),
  type: Joi.string().valid("income", "expense").required().messages({
    "any.required": "Loại giao dịch là bắt buộc",
    "any.only": "Loại giao dịch phải là Thu hoặc Chi"
  }),
  category: Joi.string().valid(...Object.values(TRANSACTION_CATEGORIES)).required().messages({
    "any.required": "Danh mục là bắt buộc",
    "any.only": "Danh mục không hợp lệ"
  }),
  amount: Joi.number().min(1).required().messages({
    "any.required": "Số tiền là bắt buộc",
    "number.min": "Số tiền phải lớn hơn 0"
  }),
  flockId: Joi.string().allow("", null).optional(),
  flockCode: Joi.string().allow("", null).optional(),
  description: Joi.string().max(500).allow("").optional().messages({
    "string.max": "Mô tả không được vượt quá 500 ký tự"
  }),
  invoiceCode: Joi.string().max(100).allow("", null).optional().messages({
    "string.max": "Mã hóa đơn không được vượt quá 100 ký tự"
  }),
  invoiceUrl: Joi.string().uri().allow("", null).optional().messages({
    "string.uri": "Link hóa đơn không hợp lệ"
  })
});

/**
 * Middleware validate tạo giao dịch
 */
export const validateCreateTransaction = (req, res, next) => {
  const { error, value } = createTransactionSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const message = error.details.map(e => e.message).join(", ");
    return res.status(400).json({
      statusCode: 400,
      message: "Dữ liệu không hợp lệ: " + message
    });
  }

  req.body = value;
  next();
};
