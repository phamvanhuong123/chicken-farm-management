import jwt from "jsonwebtoken";
import {env} from "../config/environment";
import ApiError from "~/utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { userModel } from "~/models/user.model";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Không tìm thấy token");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    const user = await userModel.findById(decoded.id);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Không tồn tại người dùng");
    }
    req.user = decoded;
    next();
  } catch (err) {
    // Token hết hạn
    if (err.name === "TokenExpiredError") {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Token đã hết hạn");
    }

    // Token không hợp lệ
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Token không hợp lệ");
  }
};
