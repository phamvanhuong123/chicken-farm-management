import express from "express";
import flockRoute from "./v1/flock.route.js";
import materialRoute from "./v1/material.route.js";
import importRoute from "./v1/import.route.js";
import authRoutes from "./v1/auth.routes.js";
import areaRoute from "./v1/area.route.js";

const router = express.Router();

router.get("/status", (req, res) => {
  res.json({ data: "ok" });
});
// nhóm route đàn gà (Chỉ định rõ prefix /flocks)
router.use('/flocks', flockRoute)
// nhóm route kho, vật tư
router.use('/materials', materialRoute)
// nhóm route chuồng
// nhập chuồng
router.use('/imports', importRoute)
router.use("/auth", authRoutes);
router.use("/areas", areaRoute);

export const APIs_V1 = router;
