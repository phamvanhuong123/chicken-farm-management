import Joi from 'joi'

export const createFlockSchema = Joi.object({
  initialCount: Joi.number().integer().min(1).required(),
  speciesId: Joi.string().required(),
  areaId: Joi.string().required(),
  ownerId: Joi.string().required(),
  avgWeight: Joi.number().min(0).default(0),
  price : Joi.number().min(0).default(0),
  note : Joi.string().min(10).max(255).trim().strict(),
  status: Joi.string().valid('Raising', 'Sold', 'Closed').default('Raising'),
  currentCount: Joi.number().integer().min(0).default(Joi.ref('initialCount'))
})

export const validateFlockCreate = (req, res, next) => {
  const { error, value } = createFlockSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  })

  if (error) {
    const message = error.details.map((e) => e.message).join(', ')
    return res.status(400).json({
      statusCode: 400,
      message: 'Dữ liệu không hợp lệ: ' + message
    })
  }

  req.body = value
  next()
}
/**
 * Schema validate khi cập nhật đàn
 */
export const updateFlockSchema = Joi.object({
  currentCount: Joi.number().integer().min(0),
  avgWeight: Joi.number().min(0),
  status: Joi.string().valid('Raising', 'Sold', 'Closed'),
  updatedAt: Joi.date().default(() => new Date())
})

/**
 * Middleware validate dữ liệu cập nhật
 */
export const validateFlockUpdate = (req, res, next) => {
  const { error } = updateFlockSchema.validate(req.body, { abortEarly: false })
  if (error) {
    const message = error.details.map((e) => e.message).join(', ')
    return res.status(400).json({ message })
  }
  next()
}
