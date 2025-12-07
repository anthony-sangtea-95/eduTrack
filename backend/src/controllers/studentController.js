import mongoose from "mongoose";
import Test from "../models/Test.js";
import Question from "../models/Question.js";
import Submission from "../models/Submission.js";

export const getAssignedTests = async (req, res) => {
  try {
    const tests = await Test.find({ assignedStudents: req.user._id }).select("-__v").populate("teacher", "name email");
    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTestQuestions = async (req, res) => {
  try {
    const { testId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(testId)) return res.status(400).json({ message: "Invalid test id" });

    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ message: "Test not found" });
    // ensure student is assigned
    if (!test.assignedStudents.map(String).includes(String(req.user._id))) return res.status(403).json({ message: "Not assigned this test" });

    const questions = await Question.find({ test: testId }).select("-correctOption"); // hide correct answers
    res.json({ test, questions });
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

    // Load correct answers
    const questionIds = answers.map(a => a.question).filter(id => mongoose.Types.ObjectId.isValid(id));
    const questions = await Question.find({ _id: { $in: questionIds } });

    // compute score
    let correct = 0;
    for (const ans of answers) {
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
