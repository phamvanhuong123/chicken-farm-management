import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { userModel } from "~/models/user.model.js"
import { sendOTPEmail } from "./emailService.js"
import { env } from "../config/environment.js"
import ApiError from "~/utils/ApiError.js"
import { StatusCodes } from "http-status-codes"

const OTP_EXPIRY = 3 * 60 * 1000

const register = async ({ username, phone, email, password }) => {
  const normalizedEmail = email?.trim().toLowerCase()
  const normalizedPhone = phone?.trim()

  const existing = await userModel.findByEmailOrPhone(normalizedEmail, normalizedPhone)
  if (existing) {
    const err = new Error("Tài khoản đã tồn tại")
    err.statusCode = 400
    throw err
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const hashedOtp = await bcrypt.hash(otp, 10)

  const user = await userModel.create({
    username,
    phone: normalizedPhone,
    email: normalizedEmail,
    password: hashedPassword,
    verified: false,
    otp: hashedOtp,
    otpExpires: Date.now() + OTP_EXPIRY
  })

  sendOTPEmail(normalizedEmail, otp).catch(console.error)

  return user
}

const verifyOTP = async ({ email, otp }) => {
  const normalizedEmail = email.trim().toLowerCase()
  const user = await userModel.findByEmail(normalizedEmail)

  if (!user) {
    const err = new Error("Không tìm thấy tài khoản")
    err.statusCode = 404
    throw err
  }

  if (user.verified) {
    const err = new Error("Tài khoản đã được xác thực")
    err.statusCode = 400
    throw err
  }

  if (!user.otp || !user.otpExpires) {
    const err = new Error("OTP không tồn tại")
    err.statusCode = 400
    throw err
  }

  if (Date.now() > user.otpExpires) {
    const err = new Error("OTP hết hạn")
    err.statusCode = 400
    throw err
  }

  const match = await bcrypt.compare(otp, user.otp)
  if (!match) {
    const err = new Error("Sai OTP")
    err.statusCode = 400
    throw err
  }

  await userModel.clearOTP(normalizedEmail)

  return true
}

const resendOTP = async (email) => {
  const normalizedEmail = email.trim().toLowerCase()
  const user = await userModel.findByEmail(normalizedEmail)

  if (!user) {
    const err = new Error("Không tìm thấy tài khoản")
    err.statusCode = 404
    throw err
  }

  if (user.verified) {
    const err = new Error("Tài khoản đã xác thực")
    err.statusCode = 400
    throw err
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const hashedOtp = await bcrypt.hash(otp, 10)

  await userModel.updateByEmail(normalizedEmail, {
    otp: hashedOtp,
    otpExpires: Date.now() + OTP_EXPIRY
  })

  await sendOTPEmail(normalizedEmail, otp)

  return true
}

const login = async ({ idName, password }) => {
  const email = idName.trim().toLowerCase()
  const phone = idName.trim()

  const user = await userModel.findByEmailOrPhone(email, phone)

  if (!user) {
    const err = new Error("Không tìm thấy tài khoản")
    err.statusCode = 404
    throw err
  }

  if (!user.verified) {
    const err = new Error("Tài khoản chưa xác thực email")
    err.statusCode = 403
    throw err
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    const err = new Error("Sai mật khẩu")
    err.statusCode = 401
    throw err
  }

  const token = jwt.sign(
    { id: String(user._id), email: user.email, userName : user.username },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  )

  return { token }
}

const findUserByParentId = async (parentId) =>{
    const employees = await userModel.findUserByParentId(parentId)
    if(employees.length === 0){
      throw new ApiError(StatusCodes.NOT_FOUND, "Chưa có nhân viên nào")
    }
    return employees
}

export const userService = {
  register,
  verifyOTP,
  resendOTP,
  login,
  findUserByParentId
}