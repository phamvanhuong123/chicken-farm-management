import nodemailer from 'nodemailer'
import { env } from '~/config/environment.js'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS
  }
})

export const sendOTPEmail = async (to, otp) => {
  const mailOptions = {
    from: env.EMAIL_USER,
    to,
    subject: 'Mã xác thực OTP của bạn',
    text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 3 phút.`
  }
  await transporter.sendMail(mailOptions)
}
