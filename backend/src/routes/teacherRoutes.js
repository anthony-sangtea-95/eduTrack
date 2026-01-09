import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
    createTest,
    getTestTypes,
    addQuestion,
    assignTest,
    getMyTests,
    getAllStudents,
    getQuestionsByTest,
} from "../controllers/teacherController.js";

const router = express.Router();

router.use(protect, requireRole("teacher"));

router.post("/tests", createTest);
router.get("/test-types", getTestTypes);
router.get("/tests/students", getAllStudents);
router.get("/tests", getMyTests);
router.get("/tests/:testId/questions", getQuestionsByTest);
router.post("/tests/:testId/questions", addQuestion);
router.post("/tests/:testId/assign", assignTest);

export default router;
