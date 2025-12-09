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
} from "~/controllers/authController.js";
import rateLimiter from "~/middlewares/rateLimiter.js";
import { userValidate } from "~/validators/user.validation";

const router = express.Router();
router.get("/", getAllUser);
router.get("/all", getAllUser); // THÊM DÒNG NÀY

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

// Thêm nhân viên
router.post("/addEmployee/:parentId", userValidate.addEmployee, addEmployee);

// Xoá nhân viên và sửa nhân viên
router
  .route("/:idEmployee")
  .delete(deleteEmployee)
  .put(userValidate.updateEmployee, updateEmployee);

export default router;
