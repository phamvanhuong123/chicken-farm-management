import express from "express";
import {
  createAreaController,
  getOverviewController,
  getAreaList,
  exportAreas,
} from "../../controllers/area.controller.js";

const router = express.Router();

router.post("/", createAreaController);
router.get("/overview", getOverviewController);
router.get("/", getAreaList);
router.get("/export", exportAreas);

export default router;
