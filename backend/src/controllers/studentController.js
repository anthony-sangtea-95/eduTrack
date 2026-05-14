import mongoose from "mongoose";
import Test from "../models/Test.js";
import Question from "../models/Question.js";
import Submission from "../models/Submission.js";

export const getAssignedTests = async (req, res) => {
  try {
    const visibleStatuses = ["published", "closed"];

    const tests = await Test.find({
        assignedStudents: req.user._id,
        status: { $in: visibleStatuses }
    })
    .select("-__v")
    .populate([
        {
            path: "teacher",
            select: "name email"
        },
        {
            path: "subject",
            select: "subjectName"
        },
        {
            path: "questions",
        }
    ]);

    // Attach latest submission (if any) per test for the requesting student
    const enhanced = await Promise.all(tests.map(async (test) => {
      const attemptCount = await Submission.countDocuments({
          test: test._id,
          student: req.user._id
      });
      const { allowRetake, maxAttempts } = test.attemptRules;

      const attemptsLeft = Math.max(maxAttempts - attemptCount,0);

      const testAccess = {
          attempted: attemptCount > 0,
          attemptCount,
          attemptsLeft,
          maxAttempts,
          canAttempt: attemptsLeft > 0,
          canRetake: allowRetake && attemptsLeft > 0,
          canViewResult: test.status === "closed" || attemptCount > 0
      };

      return {
        ...test.toObject(),
        testAccess
      }
    }));

    res.json(enhanced);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTestQuestions = async (req, res) => {
  try {
    const { testId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(testId)) return res.status(400).json({ message: "Invalid test id" });

    const test = await Test.findById(testId).populate([{
      path: 'questions',
      select: 'questionText options' // hide correct answers
    }, { path: 'subject', select: 'subjectName' }]);
    if (!test) return res.status(404).json({ message: "Test not found" });
    // ensure student is assigned
    if (!test.assignedStudents.map(String).includes(String(req.user._id))) return res.status(403).json({ message: "Not assigned this test" });

    // respect publishing and scheduling
    const now = new Date();
    if (!test.isPublished || (test.status && test.status !== 'published')) return res.status(403).json({ message: 'Test not available' });
    if (test.startTime && new Date(test.startTime) > now) return res.status(403).json({ message: 'Test not started yet' });

    res.json({ test, questions: test.questions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const submitTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const { answers } = req.body; // [{ question: qid, selected: 'a' }, ...]

    if (!mongoose.Types.ObjectId.isValid(testId)) return res.status(400).json({ message: "Invalid test id" });
    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ message: "Test not found" });
    if (!test.assignedStudents.map(String).includes(String(req.user._id))) return res.status(403).json({ message: "Not assigned this test" });

    // respect publishing, scheduling and attempt rules
    const now = new Date();
    if (!test.isPublished || (test.status && test.status !== 'published')) return res.status(403).json({ message: 'Test not available' });
    if (test.startTime && new Date(test.startTime) > now) return res.status(403).json({ message: 'Test not started yet' });

    const attemptsCount = await Submission.countDocuments({ test: testId, student: req.user._id });
    const maxAttempts = test.attemptRules?.maxAttempts ?? 1;
    if (attemptsCount >= maxAttempts) return res.status(403).json({ message: 'Maximum attempts reached' });

    // Load correct answers
    const questionIds = (answers || []).map(a => a.question).filter(id => mongoose.Types.ObjectId.isValid(id));
    const questions = await Question.find({ _id: { $in: questionIds } });

    // compute score
    let correct = 0;
    for (const ans of (answers || [])) {
      const q = questions.find(x => x._id.toString() === ans.question);
      if (q && q.correctOption === ans.selected) correct++;
    }
    const score = questions.length ? (correct / questions.length) * 100 : 0;

    // save submission
    const submission = await Submission.create({
      test: testId,
      student: req.user._id,
      answers,
      score
    });

    res.json({ message: "Submitted", submission });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const viewResult = async (req, res) => {
  try {
    const { testId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(testId)) return res.status(400).json({ message: "Invalid test id" });
    const submission = await Submission.findOne({ test: testId, student: req.user._id }).populate("answers.question");
    if (!submission) return res.status(404).json({ message: "Result not found" });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
