import Joi from "joi"
import { GET_DB } from "../config/mongodb.js"
import { ObjectId } from "mongodb"

const USER_COLLECTION_NAME = "users"

const USER_COLLECTION_SCHEMA = Joi.object({
  username: Joi.string().min(2).max(50).allow(null).default(null),
  phone: Joi.string().allow(null).default(null),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  verified: Joi.boolean().default(false),
  otp: Joi.string().allow(null).default(null),
  otpExpires: Joi.number().allow(null).default(null),
  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().timestamp('javascript').default(null)
  
})

const create = async (data) => {
  const validated = await USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
  const result = await GET_DB().collection(USER_COLLECTION_NAME).insertOne(validated)

  return { _id: result.insertedId, ...validated }
}

const findByEmailOrPhone = async (email, phone) => {
  return await GET_DB()
    .collection(USER_COLLECTION_NAME)
    .findOne({ $or: [{ email }, { phone }] })
}

const findByEmail = async (email) => {
  return await GET_DB()
    .collection(USER_COLLECTION_NAME)
    .findOne({ email })
}

const updateByEmail = async (email, data) => {
  return await GET_DB()
    .collection(USER_COLLECTION_NAME)
    .updateOne({ email }, { $set: data })
}

const clearOTP = async (email) => {
  return await GET_DB()
    .collection(USER_COLLECTION_NAME)
    .updateOne(
      { email },
      { $unset: { otp: "", otpExpires: "" }, $set: { verified: true } }
    )
}

export const userModel = {
  create,
  findByEmailOrPhone,
  findByEmail,
  updateByEmail,
  clearOTP
}