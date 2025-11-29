import express from 'express'
import { register, verifyOTP, login, resendOTP,findUserByParentId,addEmployee, getAllUser } from '~/controllers/authController.js'
import rateLimiter from '~/middlewares/rateLimiter.js'
import { userValidate } from '~/validators/user.validation'

const router = express.Router()
router.get('/',getAllUser)
router.post('/register', userValidate.createNew, rateLimiter({ windowMs: 60 * 1000, max: 5 }), register)
router.post('/verify-otp', verifyOTP)
router.post('/resend-otp', rateLimiter({ windowMs: 60 * 1000, max: 5 }), resendOTP)
router.post('/login', login)
router.get("/:parentId",findUserByParentId)
router.post("/addEmployee/:parentId",userValidate.addEmployee, addEmployee)
export default router
