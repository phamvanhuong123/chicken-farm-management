import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { GET_DB } from '~/config/mongodb.js'
import { sendOTPEmail } from '~/services/emailService.js'
import { env } from '~/config/environment.js'

const OTP_EXPIRY = 3 * 60 * 1000 

export const register = async (req, res) => {
  try {
    console.log('[register] incoming request', { ip: req.ip || req.connection?.remoteAddress, origin: req.headers?.origin, bodyEmail: req.body?.email })
    const { username, phone, email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email và password là bắt buộc' })

    const normalizedEmail = String(email).trim().toLowerCase()
    const normalizedPhone = phone ? String(phone).trim() : undefined

    const db = GET_DB()
    const users = db.collection('users')

  const existing = await users.findOne({ $or: [{ email: normalizedEmail }, { phone: normalizedPhone }] })
    if (existing) return res.status(400).json({ message: 'Tài khoản đã tồn tại' })

    const hashed = await bcrypt.hash(password, 10)

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedOtp = await bcrypt.hash(otp, 10)
    const otpExpires = Date.now() + OTP_EXPIRY

    await users.insertOne({
      username,
      phone: normalizedPhone,
      email: normalizedEmail,
      password: hashed,
      verified: false,
      otp: hashedOtp,
      otpExpires
    })

    res.status(201).json({ message: 'Đã tạo tài khoản, mã OTP sẽ được gửi tới email (nếu có thể).' })

    sendOTPEmail(normalizedEmail, otp)
      .then(() => console.log('[register] OTP email sent to', normalizedEmail))
      .catch((err) => console.error('[register] Failed to send OTP email to', normalizedEmail, err))
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp) return res.status(400).json({ message: 'Email và OTP là bắt buộc' })

    const db = GET_DB()
    const users = db.collection('users')
  const normalizedEmail = String(email).trim().toLowerCase()
  const user = await users.findOne({ email: normalizedEmail })
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' })
  console.log('[verifyOTP] user found:', { email: user.email, verified: user.verified, hasOtp: !!user.otp, otpExpires: user.otpExpires })
    if (user.verified) return res.status(400).json({ message: 'Tài khoản đã được xác thực' })
    if (!user.otp || !user.otpExpires) return res.status(400).json({ message: 'OTP không tồn tại, hãy yêu cầu gửi lại' })
    if (Date.now() > user.otpExpires) return res.status(400).json({ message: 'OTP hết hạn' })

    const match = await bcrypt.compare(String(otp), user.otp)
    if (!match) {
      console.log('[verifyOTP] otp mismatch for', email)
      return res.status(400).json({ message: 'Sai OTP' })
    }
    const result = await users.updateOne({ email: normalizedEmail }, { $set: { verified: true }, $unset: { otp: '', otpExpires: '' } })
    console.log('[verifyOTP] update result:', result)
    res.json({ message: 'Xác thực thành công!', verified: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email là bắt buộc' })

    const normalizedEmail = String(email).trim().toLowerCase()

    const db = GET_DB()
    const users = db.collection('users')
    const user = await users.findOne({ email: normalizedEmail })
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' })
    if (user.verified) return res.status(400).json({ message: 'Tài khoản đã được xác thực' })

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedOtp = await bcrypt.hash(otp, 10)
    const otpExpires = Date.now() + OTP_EXPIRY

  await users.updateOne({ email: normalizedEmail }, { $set: { otp: hashedOtp, otpExpires } })
  await sendOTPEmail(normalizedEmail, otp)

    res.json({ message: 'Đã gửi lại mã OTP, kiểm tra email.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}

export const login = async (req, res) => {
  try {
    const { idName, password } = req.body
    if (!idName || !password) return res.status(400).json({ message: 'Thông tin đăng nhập không hợp lệ' })
    const db = GET_DB()
    const users = db.collection('users')

    const maybeEmail = String(idName).trim().toLowerCase()
    const maybePhone = String(idName).trim()

    const user = await users.findOne({ $or: [{ email: maybeEmail }, { phone: maybePhone }] })
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' })
    console.log('[login] user found:', { email: user.email, verified: user.verified })
    if (!user.verified) return res.status(403).json({ message: 'Tài khoản chưa xác thực email' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ message: 'Sai mật khẩu' })

    const payload = { id: String(user._id), email: user.email }
    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN })
    res.json({ message: 'Đăng nhập thành công', token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
}
