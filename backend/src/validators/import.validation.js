import Joi from "joi";
export const validateImportCreate = (req, res, next) => {
  const schema = Joi.object({
    importDate: Joi.date().required(),
    supplier: Joi.string().required(),
    breed: Joi.string().required(),
    quantity: Joi.number().integer().min(1).required(),
    avgWeight: Joi.number().min(0.1).required(),
    barn: Joi.string().required(),
    flockId: Joi.string().allow('').optional(),                   
    status: Joi.string().valid("Đang nuôi", "Hoàn thành").optional(), 
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

export const validateImportUpdate = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      message: "Dữ liệu cập nhật không hợp lệ. Không được để trống request body.",
    });
  }

  const schema = Joi.object({
    importDate: Joi.date().optional(),
    supplier: Joi.string().optional(),
    breed: Joi.string().optional(),
    quantity: Joi.number().integer().min(1).optional(),
    avgWeight: Joi.number().min(0.1).optional(),
    barn: Joi.string().optional(),
    flockId: Joi.string().allow('').optional(),                    
    status: Joi.string().valid("Đang nuôi", "Hoàn thành").optional(), 
  }).min(1);

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      message: "Dữ liệu cập nhật không hợp lệ.",
      errors: error.details.map((e) => e.message),
    });
  }

  next();
};