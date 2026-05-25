import Test from "../models/Test.js";
import Question from "../models/Question.js";
import User from "../models/User.js";
import Subject from "../models/Subject.js";
import mongoose from "mongoose";
import Submission from "../models/Submission.js";

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
        const {
          title,
          description,
          dueDate,
          durationMinutes,
          subject,
          assignedStudents,
          isPublished,
          status,
          startTime,
          attemptRules = {}
        } = req.body;

        const test = await Test.create({
            title,
            description,
            dueDate,
            durationMinutes,
            subject,
            teacher: req.user._id,
            assignedStudents,
            isPublished: !!isPublished,
            status: status || 'draft',
            startTime: startTime ? new Date(startTime) : null,
            attemptRules: {
              allowRetake: !!attemptRules.allowRetake,
              maxAttempts: Number(attemptRules.maxAttempts) || 1,
            }
        });
        return res.status(201).json({ success: true, message: "Test created successfully", test });
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
        const {
          title,
          description,
          dueDate,
          durationMinutes,
          subject,
          assignedStudents,
          isPublished,
          status,
          startTime,
          attemptRules = {}
        } = req.body;

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
        test.durationMinutes = durationMinutes;
        test.subject = subject;
        test.assignedStudents = assignedStudents;

        // persist new fields
        test.isPublished = !!isPublished;
        test.status = status || test.status;
        test.startTime = startTime ? new Date(startTime) : test.startTime;
        test.attemptRules = {
          allowRetake: !!attemptRules.allowRetake,
          maxAttempts: Number(attemptRules.maxAttempts) || (test.attemptRules?.maxAttempts || 1)
        };

        await test.save();

        return res.json({ success: true, test });
    } catch (err) {
        return res.status(500).json({ message: "Update failed" });
    }
};

export const addQuestionToTest = async (req, res) => {
  try {
    const session = await mongoose.startSession();
    const { testId } = req.params;
    const { questionId } = req.body;
    await session.withTransaction(async () => {
      const question = await Question.findById(questionId).session(session);
      if (!question) {
        throw new Error("Question not found");
      }
      // already added?
      const testExists = await Test.findOne({
        _id: testId,
        questions: questionId
      }).session(session);

      if (testExists) {
        return;
      }
      // add question to test
      await Test.updateOne(
        { _id: testId },
        {
          $addToSet: {
            questions: questionId
          },
          $inc: {
            totalMarks: question.mark
          }
        },
        { session }
      );
    });
    res.json({
      message: "Added successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  } finally {
        session.endSession();
  }
};

export const removeQuestionFromTest = async (req, res) => {
    try {
        const session = await mongoose.startSession();
        const { testId, questionId } = req.params;
        await session.withTransaction(async () => {
            const question = await Question.findById(questionId).session(session);
            if (!question) {
                throw new Error("Question not found");
            }
            const testExists = await Test.findOne({
                _id: testId,
                questions: questionId
            }).session(session);

            // if question not part of test, skip
            if (!testExists) {
                return;
            }
            await Test.updateOne(
                { _id: testId },
                {
                    $pull: { questions: questionId },
                    $inc: { totalMarks: -question.mark }
                },
                { session }
            );
        });
        res.json({ message: "Removed Successfully" });
    } catch (error) {
        res.status(500).json({ message: "Remove failed" + error.message });
    }
}

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

export const getAccessibleQuestions = async (req, res) => {
    try {
        const { testId } = req.params;
        const test = await Test.findById(testId).populate("subject");
        if (!test) {
            return res.status(404).json({ message: "Test not found" });
        }
        const questions = await Question.find({
            subject: test.subject._id,
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

// get questions by testId
export const getQuestionsByTest = async (req, res) => {
    try {
        const { testId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(testId)) {
            return res.status(400).json({ message: "Invalid test ID" });
        }
        const test = await Test.findById(testId).populate("questions");
        if (!test) {
            return res.status(404).json({ message: "Test not found" });
        }
        res.json({
            testName: test.title,
            questions: test.questions
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// @desc Add question to a test
export const createQuestion = async (req, res) => {
    try {
        const { subject: subjectId, questionText, options, correctOption, mark,allowedTeachers = [] } = req.body;

        const subjectExists = await Subject.findById(subjectId);

        if (!subjectExists) {
            return res.status(400).json("Subject not found!!");
        }

        const question = await Question.create({
            subject: subjectId,
            questionText,
            options,
            correctOption,
            mark,
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

        // enrich with submission stats
        const enhanced = await Promise.all(tests.map(async (t) => {
          const totalSubmissions = await Submission.countDocuments({ test: t._id });
          const distinctStudents = (await Submission.distinct('student', { test: t._id })).length;
          return {
            ...t.toObject(),
            totalSubmissions,
            distinctStudentsSubmitted: distinctStudents
          };
        }));

        res.json(enhanced);
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
        const session = await mongoose.startSession();
        const { questionText, options, correctOption, mark,allowedTeachers } = req.body;
        const { questionId } = req.params;
        await session.withTransaction(async () => {
            const question = await Question.findById(questionId);
            const oldMark = question.mark;
            question.questionText = questionText;
            question.options = options;
            question.correctOption = correctOption;
            question.mark = mark;
            question.allowedTeachers = allowedTeachers;
            await question.save();
            const delta = question.mark - oldMark;
            await Test.updateMany(
                { questions: question._id },
                { $inc: { totalMarks: delta } }
            );
        });
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
