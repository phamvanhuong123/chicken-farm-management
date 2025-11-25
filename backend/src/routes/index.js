import express from "express";
import flockRoute from "./v1/flock.route.js";
import materialRoute from "./v1/material.route.js";
import authRoutes from "./v1/auth.routes.js";
import areaRoute from "./v1/area.route.js";

const router = express.Router();

router.get("/status", (req, res) => {
  res.json({ data: "ok" });
});

router.use("/flocks", flockRoute);
router.use("/materials", materialRoute);
router.use("/auth", authRoutes);
router.use("/areas", areaRoute);

export const APIs_V1 = router;
