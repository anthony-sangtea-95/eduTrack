import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
    getTeachers,
    createTest,
    updateTest,
    getSubjects,
    assignTest,
    getMyTests,
    getTestById,
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
router.get("/tests/:testId", getTestById);
router.get("/subjects/:subjectId/tests", getMyTestsBySubject);
router.delete("/tests/:testId", deleteTest);
router.post("/tests/:testId/assign", assignTest); // Assign test to specific students
router.put("/tests/:testId", updateTest);

//Question
router.post("/questions", createQuestion);
router.get("/tests/:testId/questions", getQuestionsByTest);
router.get("/questions", getQuestionsByTeacher);
router.get("/questions/:questionId", getQuestionById);
router.put("/questions/:questionId", updateQuestion);
router.delete("/questions/:questionId", deleteQuestion);
export default router;
