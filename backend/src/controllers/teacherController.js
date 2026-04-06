import Test from "../models/Test.js";
import Question from "../models/Question.js";
import User from "../models/User.js";
import Subject from "../models/Subject.js";
import mongoose from "mongoose";

// get all teachers to give permissions to specific teachers
export const getTeachers = async (req, res) => {
    try {
        const users = await User.find({ role: "teacher", _id: { $ne: req.user._id } });
        res.json(users);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

// @desc Create a new test
export const createTest = async (req, res) => {
    try {
        const { title, description, dueDate, subject, assignedStudents } = req.body;
        const test = await Test.create({
            title,
            description,
            dueDate,
            subject,
            teacher: req.user._id,
            assignedStudents
        });
        return res.status(201).json({ success: true, message: "Test created successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/teacher/tests/:id @get Test By TestId
export const getTestById = async (req, res) => {
    try {
        const { testId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(testId)) {
            return res.status(400).json({ message: "Invalid test ID" });
        }

        const test = await Test.findOne({ _id: testId, teacher: req.user._id })
            .populate("assignedStudents", "name")
            .populate("subject", "subjectName");

        if (!test) {
            return res.status(404).json({ message: "Test not found" });
        }

        return res.json(test);
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
};

// PUT /api/teacher/tests/:id @update test
export const updateTest = async (req, res) => {
    try {
        const { title, description, dueDate, subject, assignedStudents } = req.body;

        const test = await Test.findOne({
            _id: req.params.testId,
            teacher: req.user._id
        });

        if (!test) {
            return res.status(404).json({ message: "Test not found" });
        }

        test.title = title;
        test.description = description;
        test.dueDate = dueDate;
        test.subject = subject;
        test.assignedStudents = assignedStudents;

        await test.save();

        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ message: "Update failed" });
    }
};

export const addQuestionToTest = async (req, res) => {
    try {
        const { testId } = req.params;
        const { questionId } = req.body;

        const test = await Test.findById(testId);
        if (!test)
            return res.status(404).json({ message: "Test not found" });

        const question = await Question.findById(questionId);
        if (!question)
            return res.status(404).json({ message: "Question not found" });

        if (
            question.createdBy.toString() !== req.user._id.toString() &&
            !question.allowedTeachers.includes(req.user._id)
        ) {
            return res.status(403).json({ message: "Not allowed to use this question" });
        }

        // ❗ prevent duplicate
        if (test.questions.includes(questionId)) {
            return res.status(400).json({ message: "Question already added" });
        }

        test.questions.push(questionId);
        await test.save();

        res.json({ message: "Question added successfully", test });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const removeQuestionFromTest = async (req, res) => {
    try {
        const { testId } = req.params;
        const { questionId } = req.body;

        const test = await Test.findById(testId);
        if (!test)
            return res.status(404).json({ message: "Test not found" });

        // ❗ check if question exists in test
        if (!test.questions.includes(questionId)) {
            return res.status(400).json({ message: "Question not in test" });
        }

        test.questions = test.questions.filter(
            (q) => q.toString() !== questionId
        );

        await test.save();

        res.json({ message: "Question removed successfully", test });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find().select("_id subjectName");
        res.json(subjects);
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

// get questions by testId
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
export const createQuestion = async (req, res) => {
    try {
        const { subject: subjectId, test: testId, questionText, options, correctOption, allowedTeachers = [] } = req.body;

        const subjectExists = await Subject.findById(subjectId);

        if (!subjectExists) {
            return res.status(400).json("Subject not found!!");
        }

        if (testId) {
            const testExists = await Test.findById(testId);
            if (!testExists) {
                return res.status(400).json("Test not found!!");
            }
        }

        const question = await Question.create({
            test: testId || null,
            subject: subjectId,
            questionText,
            options,
            correctOption,
            createdBy: req.user._id,
            allowedTeachers,
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

export const getMyTestsBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const tests = await Test.find({ teacher: req.user._id, subject: subjectId }).populate(
            "assignedStudents",
            "name email"
        );
        res.json(tests);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// delete test
export const deleteTest = async (req, res) => {
    try {
        const { testId } = req.params;
        const deletedTest = await Test.findByIdAndDelete(testId);
        if (!deletedTest) {
            return res.status(404).json({ success: false, message: "Test not found" });
        }
        res.status(200).json({ success: true, deletedTest });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// get questions by teacher
export const getQuestionsByTeacher = async (req, res) => {
    try {
        const questions = await Question.find({
            $or: [
                { createdBy: req.user._id },
                { allowedTeachers: req.user._id }
            ]
        }).populate("subject", "subjectName");
        res.json(questions);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const getQuestionById = async (req, res) => {
    try {
        const { questionId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(questionId)) {
            return res.status(400).json({ message: "Invalid question ID" });
        }
        const question = await Question.findById(questionId);
        return res.json(question);
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const updateQuestion = async (req, res) => {
    try {
        const { questionText, options, correctOption, allowedTeachers } = req.body;
        const { questionId } = req.params;
        const question = await Question.findById(questionId);
        question.questionText = questionText;
        question.options = options;
        question.correctOption = correctOption;
        question.allowedTeachers = allowedTeachers;
        question.save();
        res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const deleteQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const deletedQuestion = await Question.findByIdAndDelete(questionId);
        if (!deletedQuestion) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }
        res.status(200).json({ success: true, deletedQuestion });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
