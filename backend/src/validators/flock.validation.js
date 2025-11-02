/**
 * Flock Validation
 * TEAM-87: Cập nhật thông tin đàn
 */

import Joi from 'joi'

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
    const message = error.details.map(e => e.message).join(', ')
    return res.status(400).json({ message })
  }
  next()
}
