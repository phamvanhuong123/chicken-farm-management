import 'dotenv/config'

export const env = {
  MONGODB_URL : process.env.MONGODB_URL,
  DATABASE_NAME : process.env.DATABASE_NAME,
  BUILD_MODE : process.env.BUILD_MODE
}