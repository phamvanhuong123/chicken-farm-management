/**
 * TEAM-122: Model Nhập chuồng
 * Lưu trữ thông tin các lứa nhập gia cầm
 */

import Joi from "joi";
import { GET_DB } from "~/config/mongodb.js";
import { ObjectId } from "mongodb";

const IMPORT_COLLECTION = "imports";

export const ImportSchema = Joi.object({
  importDate: Joi.date().required(),
  supplier: Joi.string().required(),
  breed: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
  avgWeight: Joi.number().min(0.1).required(),
  barn: Joi.string().required(),
  status: Joi.string().valid("Đang nuôi", "Hoàn thành").default("Đang nuôi"),
  createdAt: Joi.date().default(() => new Date()),
});

export const importModel = {
  async create(data) {
    const validData = await ImportSchema.validateAsync(data, {
      abortEarly: false,
    });

    const result = await GET_DB()
      .collection(IMPORT_COLLECTION)
      .insertOne(validData);

    return { ...validData, _id: result.insertedId };
  },

  async getList(query = {}) {
    const db = GET_DB();
    const collection = db.collection(IMPORT_COLLECTION);

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (query.breed) filter.breed = new RegExp(query.breed, "i");

    const items = await collection
      .find(filter)
      .sort({ importDate: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalItems = await collection.countDocuments(filter);

    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };
  },
};
