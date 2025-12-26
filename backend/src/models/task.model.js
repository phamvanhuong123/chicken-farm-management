import Joi from "joi";
import { GET_DB } from "../config/mongodb.js";
import { ObjectId } from "mongodb";
import { userModel } from "./user.model.js";
import ApiError from "~/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
const TASK_COLLECTION_NAME = "tasks";

export const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/;
export const OBJECT_ID_RULE_MESSAGE =
  "Your string fails to match the Object Id pattern!";

const TASK_SCHEMA = Joi.object({
  title: Joi.string().required().trim().strict().min(10).max(255),
  description: Joi.string().required().trim().strict().min(10).max(255),
  status: Joi.string().valid("toDo", "inProgress", "done").default("toDo"),
  employeerId: Joi.string()
    .required()
    .trim()
    .strict()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
  userId: Joi.string()
    .required()
    .trim()
    .strict()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
  areaId: Joi.string()
    .required()
    .trim()
    .strict()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
  dueDate: Joi.date().required(),
  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().default(null),
});

const validateBeforeCreateTask = async (data) => {
  return await TASK_SCHEMA.validateAsync(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

const getTaskByEmployeer = async (employeerId) => {
  try {
    const tasks = GET_DB()
      .collection(TASK_COLLECTION_NAME)
      .aggregate([
        {
          $match: { employeerId: new ObjectId(String(employeerId)) },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $lookup: {
            from: "areas",
            localField: "areaId",
            foreignField: "_id",
            as: "area",
          },
        },
        {
          $unwind: {
            path: "$area",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            areaName: "$area.name",
            userName: "$user.username",
          },
        },
        {
          $group: {
            _id: "$areaId",
            areaName : {$first : "$areaName"},
            tasks: {
              $push: {
                _id: "$_id",
                title: "$title",
                description: "$description",
                status: "$status",
                dueDate: "$dueDate",
                userName: "$userName",
                userId : "$userId",
                createdAt: "$createdAt",
              },
            },
          },
        },
        {
          $sort : {areaName : 1}
        }
      ])
      .toArray();

    return tasks;
  } catch (error) {
    throw new Error(error);
  }
};

const update = async (id, updateData) => {
  try {
    Object.keys(updateData).forEach((fieldName) => {
      if (["employeerId", "userId", "areaId"].includes(fieldName))
        delete updateData[fieldName];
    });

    const updateTask = GET_DB()
      .collection(TASK_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(String(id)),
        },
        { $set: updateData },
        { returnDocument: "after" }
      );
    return updateTask;
  } catch (error) {
    throw new Error(error);
  }
};
const findById = async (id) => {
  try {
    const task = GET_DB().collection(TASK_COLLECTION_NAME).findOne({ _id: id });
    return task;
  } catch (error) {
    throw new Error(error);
  }
};

const create = async (data) => {
  try {
    const validateData = await validateBeforeCreateTask(data);
    const existUser = await userModel.findById(validateData.userId)
    if (!existUser){
      throw new ApiError(StatusCodes.NOT_FOUND,"Không tìm thấy id người dùng")
    }
    console.log(validateData);
    const createNewTask = GET_DB()
      .collection(TASK_COLLECTION_NAME)
      .insertOne({
        ...validateData,
        userId: new ObjectId(String(validateData.userId)),
        areaId: new ObjectId(String(validateData.areaId)),
        employeerId: new ObjectId(String(validateData.employeerId)),
      });
    return createNewTask;
  } catch (error) {
    throw error
  }
};
const deleteTask = async (id) => {
  try {
    const res = GET_DB().collection(TASK_COLLECTION_NAME).deleteOne({ _id: new ObjectId(String(id))});
    return res;
  } catch (error) {
    throw new Error(error);
  }
};
export const taskModel = {
  findById,
  create,
  getTaskByEmployeer,
  update,
  deleteTask
};
