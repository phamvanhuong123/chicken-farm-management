import 'dotenv/config'

export const env = {
  MONGODB_URL : process.env.MONGODB_URL,
  DATABASE_NAME : process.env.DATABASE_NAME,
  BUILD_MODE : process.env.BUILD_MODE,
  EMAIL_USER : process.env.EMAIL_USER,
  EMAIL_PASS : process.env.EMAIL_PASS,
  JWT_SECRET : process.env.JWT_SECRET || 'please-set-JWT_SECRET-in-env',
  JWT_EXPIRES_IN : process.env.JWT_EXPIRES_IN || '3h'
}