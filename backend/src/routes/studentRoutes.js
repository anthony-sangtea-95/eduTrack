import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { getAssignedTests, getTestQuestions, submitTest } from "../controllers/studentController.js";

const router = express.Router();

router.use(protect, requireRole("student"));

router.get("/tests", getAssignedTests);
router.get("/tests/:testId", getTestQuestions);
router.post("/tests/:testId/submit", submitTest);

export default router;
