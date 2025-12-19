import express from "express";
import {
  createFinance,
  getFinanceList,
} from "../../controllers/finance.controller.js";

const router = express.Router();

router.post("/", createFinance);
router.get("/", getFinanceList);

export default router;
