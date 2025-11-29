import Joi from "joi";
import { GET_DB } from "../config/mongodb.js";
import { ObjectId } from "mongodb";

const USER_COLLECTION_NAME = "users";

const USER_COLLECTION_SCHEMA = Joi.object({
  username: Joi.string().min(2).max(50).required(),
  phone: Joi.string().allow(null).default(null),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  verified: Joi.boolean().default(false),
  otp: Joi.string().allow(null).default(null),
  otpExpires: Joi.number().allow(null).default(null),
  createdAt: Joi.date().timestamp("javascript").default(Date.now),
  updatedAt: Joi.date().timestamp("javascript").default(null),
  role: Joi.string().valid("employer", "employee").default("employee"),
  status: Joi.string().valid("working", "onLeave").default("working"),
  parentId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .message("Your string fails to match the Object Id pattern!")
    .default(null),
});

const create = async (data) => {
  const validated = await USER_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
  const result = await GET_DB()
    .collection(USER_COLLECTION_NAME)
    .insertOne(validated);

  return { _id: result.insertedId, ...validated };
};

const findById = async (id) => {
  return await GET_DB().collection(USER_COLLECTION_NAME).findOne({_id : new ObjectId(String(id))});
};

const findByEmailOrPhone = async (email, phone) => {
  return await GET_DB()
    .collection(USER_COLLECTION_NAME)
    .findOne({ $or: [{ email }, { phone }] });
};

const findByEmail = async (email) => {
  return await GET_DB().collection(USER_COLLECTION_NAME).findOne({ email });
};

const updateByEmail = async (email, data) => {
  return await GET_DB()
    .collection(USER_COLLECTION_NAME)
    .updateOne({ email }, { $set: data });
};

const clearOTP = async (email) => {
  return await GET_DB()
    .collection(USER_COLLECTION_NAME)
    .updateOne(
      { email },
      { $unset: { otp: "", otpExpires: "" }, $set: { verified: true } }
    );
};

//Tìm kiếm người dùng parentId (parentId là _id của người chủ)
const findUserByParentId = async (parentId) => {
  try {
    const record = await GET_DB()
      .collection("users")
      .find({ parentId: new ObjectId(String(parentId)) })
      .toArray();
    return record;
  } catch (e) {
    throw new Error(e);
  }
};

const addEmployee = async (parentId,data) => {
  try {
    const id = data?.idEmployee
    console.log(id)
    delete data.id
    //Chỉ cần cật nhật trường parentId là có thêm được nhân viên
    const updateUserEmployee = await GET_DB()
      .collection("users")
      .findOneAndUpdate(
        { _id: new ObjectId(String(id)) },
        { $set: {...data, parentId} },
        { returnDocument: "after" }
      );
    return updateUserEmployee
  } catch (error) {
    throw new Error(error);

  }
};
export const userModel = {
  create,
  findByEmailOrPhone,
  findByEmail,
  updateByEmail,
  clearOTP,
  findUserByParentId,
  findById,
  addEmployee
};
