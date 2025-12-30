import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import ApiError from "~/utils/ApiError";

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    username: Joi.string().min(2).max(50).allow(null).default(null),
    phone: Joi.string().allow(null).default(null),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    verified: Joi.boolean().default(false),
    otp: Joi.string().allow(null).default(null),
    otpExpires: Joi.number().allow(null).default(null),
    createdAt: Joi.date().timestamp("javascript").default(Date.now),
    updatedAt: Joi.date().timestamp("javascript").default(null),
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

const addEmployee = async (req, res, next) => {
  const conditionCorrect = Joi.object({
    idEmployee: Joi.string()
      .required()
      .strict()
      .trim()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .message("'Your string fails to match the Object Id pattern!'"),
    roleId: Joi.string().required().valid("employee").strict().trim(),
    salary: Joi.number().min(0).default(0),
  });
  try {
    await conditionCorrect.validateAsync(req.body, { abortEarly: false });
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
const updateEmployee = async (req, res, next) => {
  const conditionCorrect = Joi.object({
    roleId: Joi.string().required().valid("employee").strict().trim(),
    salary: Joi.number().strict().min(0).max(2000000000).default(0).required(),
    status: Joi.string().valid("working", "onLeave").required(),
  });
  try {
    await conditionCorrect.validateAsync(req.body, { abortEarly: false });
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

const updateUser = async (req, res, next) => {
  const conditionCorrect = Joi.object({
    username: Joi.string().min(2).max(50).trim(),
    currentPassword: Joi.string().trim(),
    newPassword: Joi.string()
      .trim()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,50}$/)
      .message("Định dạng không hợp lệ"),
    phone: Joi.string()

      .trim()
      .pattern(/^0\d{9}$/)
      .message("Số điện thoại không hợp lệ"),

    email: Joi.string().email().allow(null).optional(),

    updatedAt: Joi.date().timestamp("javascript").default(Date.now),
  });

  try {
    const idCurrent = String(req.user.id);
    const idUpdate = String(req.params.id);
    const value = await conditionCorrect.validateAsync(req.body, {
      abortEarly: false,
    });
    req.body = value;
    if (idCurrent !== idUpdate) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Bạn không có quyền sửa thông tin người dùng của người khác"
      );
    }
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
const resetpassword =async (req,res, next) => {
  const conditionCorrect = Joi.object({
    password: Joi.string()
      .trim()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,50}$/)
      .message("Định dạng không hợp lệ").required(),
    email: Joi.string().email().required(),
    otp: Joi.string().trim().strict(),
    updatedAt: Joi.date().timestamp("javascript").default(Date.now)
  });
  try{
    const validateData = await conditionCorrect.validateAsync(req.body, {
      abortEarly: false,
    });
    req.body = validateData;
    next()
  }
  catch(error){
 const errorMessage = new Error(error).message;
    const customError = new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      errorMessage
    );
    next(customError);
  }
}
export const userValidate = {
  createNew,
  addEmployee,
  updateEmployee,
  updateUser,
  resetpassword
};
