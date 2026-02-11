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
    deleteTest,
    getAllStudents,
    getQuestionsByTest,
    getQuestionsByTeacher,
    createQuestion,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
} from "../controllers/teacherController.js";

const router = express.Router();
router.use(protect, requireRole("teacher"));

//Teacher
router.get("/users", getTeachers);

//Subject
router.get("/subjects", getSubjects);

//Student
router.get("/tests/students", getAllStudents);

//Test
router.post("/tests", createTest);
router.get("/tests", getMyTests);
router.get("/tests/:subjectId", getMyTestsBySubject);
router.delete("/tests/:testId", deleteTest);
router.post("/tests/:testId/assign", assignTest); // Assign test to specific students

//Question
router.post("/questions", createQuestion);
router.get("/tests/:testId/questions", getQuestionsByTest);
router.get("/questions", getQuestionsByTeacher);
router.get("/questions/:questionId", getQuestionById);
router.put("/questions/:questionId", updateQuestion);
router.delete("/questions/:questionId", deleteQuestion);
export default router;
