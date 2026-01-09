import Test from "../models/Test.js";
import Question from "../models/Question.js";
import User from "../models/User.js";
import TestType from "../models/TestType.js";
import mongoose from "mongoose";

// @desc Create a new test
export const createTest = async (req, res) => {
    try {
        const { title, description, dueDate, testType, assignedStudents } = req.body;
        const test = await Test.create({
            title,
            description,
            dueDate,
            testType,
            teacher: req.user._id,
            assignedStudents
        });
        res.status(201).json(test);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getTestTypes = async (req, res) => {
    try {
        const testTypes = await TestType.find().select("_id typeName");
        res.json(testTypes);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// get all students to assign to test
export const getAllStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' });
        res.json(students);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// get all questions by testId
export const getQuestionsByTest = async (req, res) => {
    try {
        const { testId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(testId)) {
            return res.status(400).json({ message: "Invalid test ID" });
        }
        const questions = await Question.find({ test: testId }).populate("test");
        res.json(questions);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// @desc Add question to a test
export const addQuestion = async (req, res) => {
    try {
        const { questionText, options, correctOption } = req.body;
        const { testId } = req.params;

        const testExists = await Test.findById(testId);
        if (!testExists)
            return res.status(404).json({ message: "Test not found" });

        const question = await Question.create({
            test: testId,
            questionText,
            options,
            correctOption,
        });

        res.status(201).json(question);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc Assign test to students
export const assignTest = async (req, res) => {
    try {
        const { testId } = req.params;
        const { studentIds } = req.body; // array of student IDs

        const test = await Test.findById(testId);
        if (!test) return res.status(404).json({ message: "Test not found" });

        // Only teacher who created test can assign
        if (test.teacher.toString() !== req.user._id.toString()) {
            return res
                .status(403)
                .json({ message: "Not authorized to assign this test" });
        }

        test.assignedStudents = [
            ...new Set([...test.assignedStudents, ...studentIds]),
        ];
        await test.save();

        res.json({ message: "Test assigned successfully", test });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc Get all tests by teacher
export const getMyTests = async (req, res) => {
    try {
        const tests = await Test.find({ teacher: req.user._id }).populate(
            "assignedStudents",
            "name email"
        );
        res.json(tests);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
