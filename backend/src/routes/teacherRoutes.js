import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
    getTeachers,
    createTest,
    getSubjects,
    assignTest,
    getMyTests,
    getMyTestsBySubject,
    getAllStudents,
    getQuestionsByTest,
    getQuestionsByTeacher,
    createQuestion,
    getQuestionById,
    updateQuestion,
} from "../controllers/teacherController.js";

const router = express.Router();

router.use(protect, requireRole("teacher"));

router.get("/users", getTeachers);
router.post("/tests", createTest);
router.get("/subjects", getSubjects);

router.get("/tests/students", getAllStudents);
router.get("/tests", getMyTests);
router.get("/tests/:subjectId", getMyTestsBySubject);
router.get("/tests/:testId/questions", getQuestionsByTest);
// router.post("/tests/:testId/questions", addQuestion);  //add question to a specific test
router.post("/tests/:testId/assign", assignTest);

router.get("/questions", getQuestionsByTeacher);
router.post("/questions", createQuestion);
router.get("/questions/:questionId", getQuestionById);
router.put("/questions/:questionId", updateQuestion);
export default router;
