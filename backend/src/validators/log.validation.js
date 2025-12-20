import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import ApiError from "~/utils/ApiError";

export const createLogSchema = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": "ID người dùng là bắt buộc.",
  }),
  areaId: Joi.string().required().messages({
    "any.required": "ID khu vực là bắt buộc.",
  }),
  type: Joi.string()
    .valid("FOOD", "MEDICINE", "WATER", "DEATH", "WEIGHT", "HEALTH") // Enum chữ in hoa khớp frontend
    .required()
   ,
  quantity: Joi.number().min(0).required().messages({
    "number.min": "Số lượng phải lớn hơn 0.",
    "any.required": "Số lượng là bắt buộc."
  }),
  unit: Joi.string().required().messages({
     "any.required": "Đơn vị tính là bắt buộc."
  }),
  note: Joi.string().min(0).max(500).allow("").optional(),
});

export const validateLogCreate = (req, res, next) => {
  const { error, value } = createLogSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const message = error.details.map((e) => e.message).join(", ");
    throw new ApiError(StatusCodes.BAD_REQUEST,"Dữ liệu không hợp lệ : " + message)
    
  }

  req.body = value;
  next();
};

export const updateLogSchema = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": "ID người dùng là bắt buộc.",
  }),
  areaId: Joi.string().required(),
  type: Joi.string().valid("FOOD", "MEDICINE", "WATER", "DEATH", "WEIGHT", "HEALTH").optional(),
  quantity: Joi.number().min(0).optional(),
  unit: Joi.string().allow("").optional(),
  note: Joi.string().max(500).allow("").optional(),
  updatedAt: Joi.date().default(() => new Date()),
});

export const validateLogUpdate = (req, res, next) => {
  const { error } = updateLogSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const message = error.details.map((e) => e.message).join(", ");
    throw new ApiError(StatusCodes.BAD_REQUEST,"Dữ liệu không hợp lệ : " + message)
  }
  next();
};