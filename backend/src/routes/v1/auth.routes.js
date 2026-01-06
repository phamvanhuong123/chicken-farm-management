import express from "express";
import {
  register,
  verifyOTP,
  login,
  resendOTP,
  findUserByParentId,
  addEmployee,
  getAllUser,
  deleteEmployee,
  updateEmployee,
  verifyTokenController,
  findUserById,
  updateUser,
  sendOtp,
  verifyOTPForgotPassword,
  resetPassword
} from "~/controllers/authController.js";
import { verifyToken } from "~/middlewares/authMiddleware";
import { authorize } from "~/middlewares/authorizeMiddleware";
import { multerUploadMiddleware } from "~/middlewares/MulterUploadMiddleware";
import rateLimiter from "~/middlewares/rateLimiter.js";
import { ROLE } from "~/utils/constants";
import { userValidate } from "~/validators/user.validation";

const router = express.Router();
router.get("/", getAllUser);
router.get("/all", getAllUser);

router.post(
  "/register",
  userValidate.createNew,
  rateLimiter({ windowMs: 60 * 1000, max: 5 }),

  register
);
router.post("/verify-otp", verifyOTP);
router.post(
  "/resend-otp",
  rateLimiter({ windowMs: 60 * 1000, max: 5 }),
  resendOTP
);
router.post("/login", login);

// Tìm nhân viên theo parentId
router.get("/:parentId", findUserByParentId);
//Tìm người dùng theo ID
// router.get("/user/:id", findUserById)

//Cật nhật thông tin người dùng và tìm kiếm thông tin người dùng
router
  .route("/user/:id")
  .get(findUserById)
  .put(verifyToken,multerUploadMiddleware.upload.single('avatar'), userValidate.updateUser, updateUser);
// Thêm nhân viên
router.post(
  "/addEmployee/:parentId",
  verifyToken,
  authorize(ROLE.EMPLOYER),
  userValidate.addEmployee,
  addEmployee
);

//Xác thực token
router.get("/verify", verifyTokenController);
// Xoá nhân viên và sửa nhân viên
router
  .route("/:idEmployee")
  .delete(verifyToken, authorize(ROLE.EMPLOYER), deleteEmployee)
  .put(
    verifyToken,
    authorize(ROLE.EMPLOYER),
    userValidate.updateEmployee,
    updateEmployee
  );


  //Tính năng quên mật khẩu
  router.post("/forgot-password/send-otp",sendOtp)
  router.post("/forgot-password/verify-otp",verifyOTPForgotPassword)
  router.post("/forgot-password/reset",userValidate.resetpassword,resetPassword)

export default router;
