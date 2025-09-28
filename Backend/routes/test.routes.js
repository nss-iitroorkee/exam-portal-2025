import { Router } from "express";
import {
  getAllTests,
  getTestInfo,
  processCSV,
  search,
  submitTest,
  upload,
} from "../controllers/test.controller.js";

const router = Router();

router.post("/createTest", upload.single("file"), processCSV);
router.get("/getAllTests", getAllTests);
router.get("/search", search);
router.get("/getInfo", getTestInfo);
router.post("/submit", submitTest);

export default router;
