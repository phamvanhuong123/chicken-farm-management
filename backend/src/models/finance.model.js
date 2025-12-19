import Joi from "joi";
import { GET_DB } from "../config/mongodb.js";
import { ObjectId } from "mongodb";

export const FINANCE_COLLECTION_NAME = "finances";

export const FINANCE_TYPE = {
  INCOME: "Thu",
  EXPENSE: "Chi",
};

export const FINANCE_CATEGORY = [
  "Thức ăn",
  "Thuốc",
  "Nhân công",
  "Điện nước",
  "Bán hàng",
  "Khác",
];

export const FINANCE_SCHEMA = Joi.object({
  financeDate: Joi.date().required(),

  type: Joi.string()
    .valid(...Object.values(FINANCE_TYPE))
    .required(),

  category: Joi.string()
    .valid(...FINANCE_CATEGORY)
    .required(),

  amount: Joi.number().min(1).required(),

  flockId: Joi.string().allow(null),

  description: Joi.string().max(255).required(),

  invoiceNumber: Joi.string().allow("", null),

  createdAt: Joi.date().default(Date.now),
  updatedAt: Joi.date().allow(null),
});

const validateBeforeCreate = async (data) => {
  return await FINANCE_SCHEMA.validateAsync(data, { abortEarly: false });
};

const create = async (data) => {
  const validData = await validateBeforeCreate(data);

  const docToInsert = {
    ...validData,
    flockId: validData.flockId ? new ObjectId(validData.flockId) : null,
    createdAt: new Date(),
    updatedAt: null,
  };

  return await GET_DB()
    .collection(FINANCE_COLLECTION_NAME)
    .insertOne(docToInsert);
};
//Lấy danh sách giao dịch tài chính
const find = async (filter = {}, options = {}) => {
  const cursor = GET_DB()
    .collection(FINANCE_COLLECTION_NAME)
    .find(filter, options);
  return await cursor.toArray();
};

export const financeModel = {
  FINANCE_COLLECTION_NAME,
  create,
  find,
};
