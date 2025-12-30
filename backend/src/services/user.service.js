import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userModel } from "~/models/user.model.js";
import { sendOTPEmail } from "~/providers/NodeMailerProVider.js";
import { env } from "../config/environment.js";
import ApiError from "~/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const OTP_EXPIRY = 3 * 60 * 1000;

const register = async ({ username, phone, email, password }) => {
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedPhone = phone?.trim();

  const existing = await userModel.findByEmailOrPhone(
    normalizedEmail,
    normalizedPhone
  );
  if (existing) {
    const err = new Error("Tài khoản đã tồn tại");
    err.statusCode = 400;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);

  const user = await userModel.create({
    username,
    phone: normalizedPhone,
    email: normalizedEmail,
    password: hashedPassword,
    verified: false,
    otp: hashedOtp,
    otpExpires: Date.now() + OTP_EXPIRY,
  });

  sendOTPEmail(normalizedEmail, otp).catch(console.error);

  return user;
};

const verifyOTP = async ({ email, otp }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await userModel.findByEmail(normalizedEmail);

  if (!user) {
    const err = new Error("Không tìm thấy tài khoản");
    err.statusCode = 404;
    throw err;
  }

  if (user.verified) {
    const err = new Error("Tài khoản đã được xác thực");
    err.statusCode = 400;
    throw err;
  }

  if (!user.otp || !user.otpExpires) {
    const err = new Error("OTP không tồn tại");
    err.statusCode = 400;
    throw err;
  }

  if (Date.now() > user.otpExpires) {
    const err = new Error("OTP hết hạn");
    err.statusCode = 400;
    throw err;
  }

  const match = await bcrypt.compare(otp, user.otp);
  if (!match) {
    const err = new Error("Sai OTP");
    err.statusCode = 400;
    throw err;
  }

  await userModel.clearOTP(normalizedEmail);

  return true;
};

const resendOTP = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await userModel.findByEmail(normalizedEmail);

  if (!user) {
    const err = new Error("Không tìm thấy tài khoản");
    err.statusCode = 404;
    throw err;
  }

  if (user.verified) {
    const err = new Error("Tài khoản đã xác thực");
    err.statusCode = 400;
    throw err;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);

  await userModel.updateByEmail(normalizedEmail, {
    otp: hashedOtp,
    otpExpires: Date.now() + OTP_EXPIRY,
  });

  await sendOTPEmail(normalizedEmail, otp);

  return true;
};

const login = async ({ idName, password }) => {
  const email = idName.trim().toLowerCase();
  const phone = idName.trim();

  const user = await userModel.findByEmailOrPhone(email, phone);
  console.log(user.roleId);
  if (!user) {
    const err = new Error("Không tìm thấy tài khoản");
    err.statusCode = 404;
    throw err;
  }

  if (!user.verified) {
    const err = new Error("Tài khoản chưa xác thực email");
    err.statusCode = 403;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error("Sai mật khẩu");
    err.statusCode = 401;
    throw err;
  }
  const token = jwt.sign(
    {
      id: String(user._id),
      email: user.email,
      userName: user.username,
      roleId: user.roleId,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return { token };
};

const findUserByParentId = async (parentId) => {
  const employees = await userModel.findUserByParentId(parentId);
  if (employees.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Chưa có nhân viên nào");
  }
  return employees;
};

const findUserById = async (id) => {
  const user = await userModel.findById(id);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy người dùng");
  }

  delete user.password;
  return user;
};

const addEmployee = async (parentId, body) => {
  const existUserParent = await userModel.findById(parentId);
  try {
    if (!existUserParent) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không có người nào");
    }

    //tìm kiếm nhân viên rồi cật nhập trường parentId
    const newEmployee = await userModel.addEmployee(parentId, body);
    return newEmployee;
  } catch (error) {
    throw error;
  }
};

const getAllUser = async () => {
  const users = await userModel.getAllUser();

  if (users.length === 0 || !users) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Không tồn tại người dùng nào");
  }
  return users;
};

const updateEmployee = async (idEmployee, body) => {
  try {
    //tìm kiếm nhân viên rồi cật nhập trường parentId
    const updateEmployee = await userModel.updateEmployee(idEmployee, body);
    return updateEmployee;
  } catch (error) {
    throw error;
  }
};
const deleteEmployee = async (idEmployee) => {
  try {
    const res = await userModel.deleteEmployee(idEmployee);
    return res;
  } catch (error) {
    throw error;
  }
};

const updateUser = async (id, updateData, userAvataFile) => {
  try {
    const existUser = await userModel.findById(id);
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Người dùng không tồn tại");
    }
    //Trường hợp thay đổi mật khẩu
    if (updateData.currentPassword || updateData.newPassword) {
      if (!updateData.currentPassword || !updateData.newPassword) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Phải cung cấp cả mật khẩu cũ và mật khẩu mới"
        );
      }

      // so sánh mật khẩu cũ có khớp hay không
      const isMatch = await bcrypt.compare(
        updateData.currentPassword,
        existUser.password
      );
      if (!isMatch) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Mật khẩu cũ không hợp lệ");
      }
      if (
        String(updateData.currentPassword) === String(updateData.newPassword)
      ) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Mật khẩu cũ và mới không được trùng nhau"
        );
      }
      const hasPassword = await bcrypt.hash(updateData.newPassword, 10);
      updateData.password = hasPassword;
      delete updateData.currentPassword;
      delete updateData.newPassword;
    }

    //Trường hợp cật nhập upload file
    if (userAvataFile) {
      //upload file cloudinary
    }

    const updatedUser = await userModel.updateUser(id, updateData);

    return updatedUser;
  } catch (error) {
    throw error;
  }
};
const sendOtp = async (email) => {
  try {
    ``;
    const existUser = await userModel.findByEmail(email);
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Tài khoản không tồn tại");
    }
    //Tạo ra mã otp
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await userModel.updateByEmail(email.trim(), {
      otp: hashedOtp,
      otpExpires: Date.now() + OTP_EXPIRY,
    });
    sendOTPEmail(email, otp).catch(console.error);

    return `OTP đã được gửi tới email ${existUser.email} vui lòng kiểm tra tài khoản email của bạn`;
  } catch (error) {
    throw error;
  }
};

const verifyOTPForgotPassword = async (email, otp) => {
  try {
    const normalizedEmail = email.trim();
    const user = await userModel.findByEmail(normalizedEmail);

    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy tài khoản");
    }
    if (!user.verified) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Tài khoản chưa được xác thực"
      );
    }

    if (!user.otp || !user.otpExpires) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "OTP không tồn tại");
    }

    const match = await bcrypt.compare(otp, user.otp);
    if (!match) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Sai OTP");
    }

    if (Date.now() > user.otpExpires) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "OTP hết hạn");
    }

    return "Xác thực thành công";
  } catch (error) {
    throw error;
  }
};

const resetPassword = async (email, password,otp) => {
  try {
    //TÌm email
    const existUser = await userModel.findByEmail(email);
    if (!existUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Không tìm thấy tài khoản");
    }
    

    const match = await bcrypt.compare(otp, existUser.otp);
    if (!match) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Thiếu thông tin hợp lệ");
    }

    if (Date.now() > existUser.otpExpires) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Bạn đã hết thời gian đổi mật khẩu vui lòng gửi lại email");
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await userModel.updateUser(existUser._id, {
      password: hashedPassword,
    });
    await userModel.clearOTP(email.trim());
    return result;
  } catch (error) {
    throw error;
  }
};

export const userService = {
  register,
  verifyOTP,
  resendOTP,
  login,
  findUserByParentId,
  addEmployee,
  getAllUser,
  deleteEmployee,
  updateEmployee,
  findUserById,
  updateUser,
  sendOtp,
  verifyOTPForgotPassword,
  resetPassword,
};
