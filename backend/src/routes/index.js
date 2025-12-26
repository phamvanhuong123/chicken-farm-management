import express from "express";
import flockRoute from "./v1/flock.route.js";
import materialRoute from "./v1/material.route.js";
import importRoute from "./v1/import.route.js";
import authRoutes from "./v1/auth.routes.js";
import areaRoute from "./v1/area.route.js";
import transactionRoute from "./v1/transaction.route.js";
import { taskRoute } from "./v1/task.route.js";
import financeRoute from "./v1/finance.route.js";
import { logRoute } from "./v1/log.route.js";
import dashboardRoute from "./v1/dashboard.route.js";
import dashboardChartRoutes from "./v1/dashboard.chart.routes.js";
import { verifyToken } from "~/middlewares/authMiddleware.js";

const router = express.Router();

router.get("/status", (req, res) => {
  res.json({ data: "ok" });
});

// nhóm route đàn gà (Chỉ định rõ prefix /flocks)
router.use("/flocks", verifyToken, flockRoute);
// nhóm route kho, vật tư
router.use("/materials", verifyToken, materialRoute);
// nhóm route chuồng
router.use("/areas", verifyToken, areaRoute);
// nhập chuồng
router.use("/imports", verifyToken, importRoute);
router.use("/auth", authRoutes);
router.use("/transactions", transactionRoute);
router.use("/logs", verifyToken, logRoute);
router.use("/tasks", verifyToken, taskRoute);
router.use("/dashboard", verifyToken, dashboardRoute);
router.use("/dashboard/charts", verifyToken, dashboardChartRoutes);

// Route tài chính
router.use("/finance", verifyToken, financeRoute);

export const APIs_V1 = router;
