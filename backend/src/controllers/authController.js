import { StatusCodes } from "http-status-codes";
import { userService } from "~/services/user.service";
import ApiError from "~/utils/ApiError";

export const register = async (req, res, next) => {
  try {
    const user = await userService.register(req.body);
    res.status(201).json({
      message: "Tạo tài khoản thành công, vui lòng xác thực OTP",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    await userService.verifyOTP(req.body);
    res.status(200).json({ message: "Xác thực thành công!" });
  } catch (error) {
    next(error);
  }
};

export const resendOTP = async (req, res, next) => {
  try {
    await userService.resendOTP(req.body.email);
    res.status(200).json({ message: "Đã gửi lại OTP, kiểm tra email" });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body);
    res.status(200).json({
      message: "Đăng nhập thành công",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
export const findUserByParentId = async (req, res, next) => {
  try {
    const parentId = req.params.parentId;
    if (!parentId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Thiếu parentId");
    }
    const result = await userService.findUserByParentId(parentId);

    res.status(StatusCodes.ACCEPTED).json({
      statusCode: StatusCodes.ACCEPTED,
      message: "Thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const findUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Thiếu id");
    }
    const result = await userService.findUserById(id);

    res.status(StatusCodes.ACCEPTED).json({
      statusCode: StatusCodes.ACCEPTED,
      message: "Thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const addEmployee = async (req, res, next) => {
  try {
    const parentId = req.params.parentId;
    const result = await userService.addEmployee(parentId, req.body);
    res.status(StatusCodes.CREATED).json({
      statusCode: StatusCodes.CREATED,
      message: "Thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUser = async (req, res, next) => {
  try {
    const result = await userService.getAllUser();
    res.status(StatusCodes.ACCEPTED).json({
      statusCode: StatusCodes.ACCEPTED,
      message: "Thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const userAvataFile = req.file;
    // console.log("File : ", userAvataFile)
    const result = await userService.updateUser(id, req.body, userAvataFile);
    res.status(StatusCodes.ACCEPTED).json({
      statusCode: StatusCodes.ACCEPTED,
      message: "Cật nhật thông tin người dùng thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const idEmployee = req.params.idEmployee;
    const result = await userService.updateEmployee(idEmployee, req.body);
    res.status(StatusCodes.ACCEPTED).json({
      statusCode: StatusCodes.ACCEPTED,
      message: "Cật nhật nhân viên thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (req, res, next) => {
  try {
    const idEmployee = req.params.idEmployee;
    const result = await userService.deleteEmployee(idEmployee);
    res.status(StatusCodes.ACCEPTED).json({
      statusCode: StatusCodes.ACCEPTED,
      message: "Xoá nhân viên thành công",
      data: result,
    });
  } catch (erorr) {
    next(erorr);
  }
};

export const verifyTokenController = (req, res) => {
  res.status(StatusCodes.OK).json({
    statusCode: 200,
    message: "Xác thực token thành công",
  });
};

export const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await userService.sendOtp(email);
    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: result,
    });
  } catch (error) {
    next(error);
  }
};
export const verifyOTPForgotPassword = async (req, res, next) => {
  try {
    const { email,otp } = req.body;
    const result = await userService.verifyOTPForgotPassword(email,otp);
    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: result,
    });
  } catch (error) {
    next(error);
  }
};
export const resetPassword = async (req, res, next) =>{
  try{
    const {email,password,otp} = req.body
    const result = await userService.resetPassword(email,password,otp)
    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: result,
    });
  }
  catch(error) {
    next(error)
  }
}