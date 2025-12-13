import Joi from 'joi';
import { GET_DB } from '../config/mongodb.js'
import {ObjectId} from 'mongodb'
const TASK_COLLECTION_NAME = 'tasks'

export const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/
export const OBJECT_ID_RULE_MESSAGE = 'Your string fails to match the Object Id pattern!'


const TASK_SCHEMA = Joi.object({
  title : Joi.string().required().trim().strict().min(10).max(255),
  description : Joi.string().required().trim().strict().min(10).max(255),
  status : Joi.string().valid("toDo", "inProgress","done").default("toDo"),
  employeerId : Joi.string().required().trim().strict().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  userId : Joi.string().required().trim().strict().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  areaId : Joi.string().required().trim().strict().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  dueDate : Joi.date().required(),
  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().default(null),
});

const validateBeforeCreateTask = async (data) => {
  return await TASK_SCHEMA.validateAsync(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

const findById = async (id) => {
try{
    const task =  GET_DB().collection(TASK_COLLECTION_NAME).findOne({_id : id})
    return task
  }
  catch (error){
     throw new Error(error)
  }
}

const create = async (data) => {
  try{
    const validateData = await validateBeforeCreateTask(data)
    console.log(validateData)
    const createNewTask = GET_DB().collection(TASK_COLLECTION_NAME).insertOne({
      ...validateData,
      userId : new ObjectId(String(validateData.userId)),
      areaId : new ObjectId(String(validateData.areaId)),
      employeerId : new ObjectId(String(validateData.employeerId)),
    })
    return createNewTask
  }
  catch (error){
     throw new Error(error)
  }
}
export const taskModel = {
    findById,
    create
}


