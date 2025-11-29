import express from "express";
import flockRoute from "./v1/flock.route.js";
import materialRoute from "./v1/material.route.js";
import importRoute from "./v1/import.route.js";
import authRoutes from "./v1/auth.routes.js";
import areaRoute from "./v1/area.route.js";

const router = express.Router();

// Status check
router.get("/status", (req, res) => {
  res.json({ data: "ok" });
});

// Flocks (Đàn gà)
router.use("/flocks", flockRoute);

// Materials (Kho vật tư)
router.use("/materials", materialRoute);

// Import (Nhập chuồng)
router.use("/imports", importRoute);

// Auth
router.use("/auth", authRoutes);

// Areas (Khu nuôi)
router.use("/areas", areaRoute);

export const APIs_V1 = router;
