import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    createTest,
    addQuestion,
    assignTest,
    getMyTests,
} from "../controllers/teacherController.js";

const router = express.Router();

router.use(protect); // all routes protected

router.post("/tests", createTest);
router.get("/tests", getMyTests);
router.post("/tests/:testId/questions", addQuestion);
router.post("/tests/:testId/assign", assignTest);

export default router;
