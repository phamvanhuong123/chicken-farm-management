import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError";

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Chưa xác thực");
    }

    if (!roles.length) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Authorize middleware thiếu role"
      );
    }

    if (!roles.includes(req.user.roleId)) {
      console.log(roles)
      console.log(req.user.roleId)
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Bạn không có quyền truy cập tài nguyên này"
      );
    }

    next();
  };
};
