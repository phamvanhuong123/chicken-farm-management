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
  verifyTokenController
  
} from "~/controllers/authController.js";
import { verifyToken } from "~/middlewares/authMiddleware";
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
router.post("/addEmployee/:parentId",verifyToken, userValidate.addEmployee, addEmployee);

//Xác thực token
router.get("/verify", verifyTokenController);
// Xoá nhân viên và sửa nhân viên
router
  .route("/:idEmployee")
  .delete(deleteEmployee)
  .put(userValidate.updateEmployee, updateEmployee);

export default router;
