import Joi from "joi";
import { GET_DB } from "../config/mongodb.js";
import { ObjectId } from "mongodb";

export const AREA_COLLECTION_NAME = "areas";

export const AREA_STATUS = {
  ACTIVE: "ACTIVE", // Đang hoạt động
  EMPTY: "EMPTY", // Đang trống
  MAINTENANCE: "MAINTENANCE", // Bảo trì
  INCIDENT: "INCIDENT", // Có sự cố
};

export const AREA_SCHEMA = Joi.object({
  name: Joi.string().max(50).required(),
  currentCapacity: Joi.number().integer().min(0).default(0),
  maxCapacity: Joi.number().integer().min(1).required(),
  staff: Joi.array()
    .items(
      Joi.object({
        staffId: Joi.string().allow(null),
        name: Joi.string().required(),
        avatarUrl: Joi.string().allow("", null),
      })
    )
    .default([]),
  status: Joi.string()
    .valid(...Object.values(AREA_STATUS))
    .default(AREA_STATUS.ACTIVE),
  note: Joi.string().allow("", null).default(""),
  createdAt: Joi.date().timestamp().default(Date.now),
  updatedAt: Joi.date().timestamp().allow(null).default(null),
});

const validateBeforeCreate = async (data) => {
  return await AREA_SCHEMA.validateAsync(data, { abortEarly: false });
};

const create = async (data) => {
  try {
    const validData = await validateBeforeCreate(data);

    const docToInsert = {
      ...validData,
      staff: validData.staff.map((s) => ({
        ...s,
        staffId: s.staffId ? new ObjectId(s.staffId) : undefined,
      })),
      createdAt: new Date(),
      updatedAt: null,
    };

    const result = await GET_DB()
      .collection(AREA_COLLECTION_NAME)
      .insertOne(docToInsert);

    return result;
  } catch (error) {
    if (error.isJoi) {
      error.statusCode = 400;
    } else if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error;
  }
};

const count = async (filter = {}) => {
  return await GET_DB().collection(AREA_COLLECTION_NAME).countDocuments(filter);
};

const find = async (filter = {}, options = {}) => {
  const cursor = GET_DB()
    .collection(AREA_COLLECTION_NAME)
    .find(filter, options);
  return await cursor.toArray();
};
const findById = async (id) => {
  try {
      const area = GET_DB().collection(AREA_COLLECTION_NAME).findOne({ _id: new ObjectId(String(id)) });
      return area;
    } catch (error) {
      throw new Error(error);
    }
}
const update = async (id, data) => {
  try {
    const docToUpdate = { ...data };

    // map staffId sang ObjectId nếu có
    if (Array.isArray(docToUpdate.staff)) {
      docToUpdate.staff = docToUpdate.staff.map((s) => ({
        ...s,
        staffId: s.staffId ? new ObjectId(s.staffId) : s.staffId,
      }));
    }

    docToUpdate.updatedAt = new Date();

    const result = await GET_DB()
      .collection(AREA_COLLECTION_NAME)
      .updateOne({ _id: new ObjectId(id) }, { $set: docToUpdate });

    return result;
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error;
  }
};
const aggregate = async (pipeline = []) => {
  return await GET_DB()
    .collection(AREA_COLLECTION_NAME)
    .aggregate(pipeline)
    .toArray();
};

export const areaModel = {
  AREA_COLLECTION_NAME,
  AREA_SCHEMA,
  AREA_STATUS,
  create,
  count,
  find,
  aggregate,
  update,
  findById
};


