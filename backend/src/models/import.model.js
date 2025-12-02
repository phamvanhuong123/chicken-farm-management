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
  updatedAt: Joi.date().default(() => new Date()),
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

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;

    return await GET_DB()
      .collection(IMPORT_COLLECTION)
      .findOne({ _id: new ObjectId(id) });
  },

  async update(id, data) {
    try {
      if (!ObjectId.isValid(id)) {
        return null;
      }

      const objectId = new ObjectId(String(id).trim());

      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      const result = await GET_DB()
        .collection(IMPORT_COLLECTION)
        .updateOne(
          { _id: objectId },
          { $set: updateData }
        );

      if (result.matchedCount === 0) return null;

      return await GET_DB()
        .collection(IMPORT_COLLECTION)
        .findOne({ _id: objectId });

    } catch (err) {
      console.error("UPDATE ERROR:", err);
      return null;
    }
  },


  async delete(id) {
    if (!ObjectId.isValid(id)) throw new Error("Invalid ID");

    const result = await GET_DB()
      .collection(IMPORT_COLLECTION)
      .findOneAndDelete({ _id: new ObjectId(id) });

    return result.value;
  },
};
