import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError";

const Joi = require("joi");
export const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/;
export const OBJECT_ID_RULE_MESSAGE =
  "Your string fails to match the Object Id pattern!";
const create = async (req, res, next) => {
  const correctCondition = Joi.object({
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
    dueDate: Joi.date().required().min('now'),
    createdAt: Joi.date().default(() => new Date()),
    updatedAt: Joi.date().default(null),
  });

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const errorMessage = new Error(error).message;
    const customError = new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      errorMessage
    );
    next(customError);
  }
};


const update = async (req, res, next) => {
  const correctCondition = Joi.object({
    title: Joi.string().trim().strict().min(10).max(255),
    description: Joi.string().trim().strict().min(10).max(255),
    status: Joi.string().valid("toDo", "inProgress", "done").default("toDo"),
    employeerId: Joi.string()
      
      .trim()
      .strict()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),

    userId: Joi.string()
      
      .trim()
      .strict()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
    areaId: Joi.string()
      
      .trim()
      .strict()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
    dueDate: Joi.date().min('now'),
    createdAt: Joi.date().default(() => new Date()),
    updatedAt: Joi.date().default(null),
  });

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const errorMessage = new Error(error).message;
    const customError = new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      errorMessage
    );
    next(customError);
  }
};

export const taskValidate = {
  create,
  update
};
