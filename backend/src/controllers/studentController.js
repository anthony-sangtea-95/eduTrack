import mongoose from "mongoose";
import Test from "../models/Test.js";
import Question from "../models/Question.js";
import Submission from "../models/Submission.js";

export const getStudentDashboard = async (req, res) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.user._id);

    // Get tests assigned to this student
    const tests = await Test.find({
      assignedStudents: studentId,
      status: { $in: ["published", "closed"] }
    })
      .select(
        "title description subject questions totalMarks passPercentage dueDate status"
      )
      .populate("subject", "name")
      .lean();

    const testIds = tests.map(test => test._id);

    // Get submitted attempts
    const submissions = await Submission.find({
      student: studentId,
      test: { $in: testIds },
      submittedAt: { $ne: null }
    })
      .populate("test", "title totalMarks passPercentage dueDate")
      .sort({ submittedAt: -1 })
      .lean();

    console.log("Submissions:", submissions);
    // A test is completed if student has at least one submitted attempt
    const completedTestIds = new Set(
      submissions.map(sub => sub.test?._id?.toString())
    );

    const assigned = tests.length;

    const completed = completedTestIds.size;

    const pending = tests.filter(
      test => !completedTestIds.has(test._id.toString())
    ).length;

    // Calculate passed / failed
    const passed = submissions.filter(sub => {
      if (!sub.test) return false;

      const totalMarks = sub.test.totalMarks || 0;
      const passPercentage = sub.test.passPercentage ?? 50;

      if (totalMarks <= 0) return false;

      const percentage = (sub.score / totalMarks) * 100;

      return percentage >= passPercentage;
    }).length;

    const failed = submissions.filter(sub => {
      if (!sub.test) return false;

      const totalMarks = sub.test.totalMarks || 0;
      const passPercentage = sub.test.passPercentage ?? 50;

      if (totalMarks <= 0) return false;

      const percentage = (sub.score / totalMarks) * 100;

      return percentage < passPercentage;
    }).length;

    // Average score percentage
    let averageScore = 0;

    if (submissions.length > 0) {
      const totalPercentage = submissions.reduce((sum, sub) => {
        const totalMarks = sub.test?.totalMarks || 0;

        if (totalMarks <= 0) return sum;

        return sum + (sub.score / totalMarks) * 100;
      }, 0);

      averageScore = Math.round(totalPercentage / submissions.length);
    }

    // Total time spent
    const totalTimeInSeconds = submissions.reduce(
      (sum, sub) => sum + (sub.timeTakenInSeconds || 0),
      0
    );

    // Recent submissions
    const recentSubmissions = submissions.slice(0, 5).map(sub => {
      const totalMarks = sub.test?.totalMarks || 0;

      const percentage =
        totalMarks > 0
          ? Math.round((sub.score / totalMarks) * 100)
          : 0;

      const passPercentage = sub.test?.passPercentage ?? 50;

      return {
        _id: sub._id,
        testId: sub.test?._id,
        title: sub.test?.title,
        score: sub.score,
        totalMarks,
        percentage,
        passed: percentage >= passPercentage,
        correct: sub.correct,
        wrong: sub.wrong,
        timeTakenInSeconds: sub.timeTakenInSeconds,
        submittedAt: sub.submittedAt
      };
    });

    res.json({
      stats: {
        assigned,
        completed,
        pending,
        passed,
        failed,
        averageScore,
        totalTimeInSeconds
      },
      recentSubmissions
    });

  } catch (error) {
    console.error("getStudentDashboard:", error);

    res.status(500).json({
      message: "Failed to load student dashboard"
    });
  }
};

export const getAssignedTests = async (req, res) => {
  try {
    const tests = await Test.find({
        assignedStudents: req.user._id,
        status: { $ne: "draft" },
        questions: { $exists: true, $not: { $size: 0 } }
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
      let isPublished = false;
      let testStatus = null;
      const attemptCount = await Submission.countDocuments({
          test: test._id,
          student: req.user._id
      });
      const { allowRetake, maxAttempts } = test.attemptRules;
      const attemptsLeft = Math.max(maxAttempts - attemptCount,0);
      if (test.startTime && new Date() < test.startTime) {
        // upcoming — visible but cannot start
        testStatus = "upcoming";
      } else {
          if ((test.dueDate && new Date() >= test.dueDate) || (test.status && test.status === "closed")) {
            // expired — visible but cannot start
            testStatus = "closed";
          } else {
            isPublished = true;
            testStatus = "published";
          }
      }
      const testAccess = {
          attemptCount,
          attemptsLeft,
          maxAttempts,
          canStart: isPublished && attemptCount < 1,
          canAttempt: isPublished && attemptsLeft > 0,
          canRetake: isPublished && allowRetake && attemptsLeft > 0 && attemptCount > 0,
          canViewResult: attemptCount > 0
      };
      return {
        ...test.toObject(),
        testStatus,
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

export const getCreateAttemptID = async (req, res) => {
  try {
    const { testId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(testId)) return res.status(400).json({ message: "Invalid test id" });

    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ message: "Test not found" });

    // ensure student is assigned
    if (!test.assignedStudents.map(String).includes(String(req.user._id))) return res.status(403).json({ message: "Not assigned this test" });

    // respect publishing and scheduling
    const now = new Date();
    if (!test.isPublished || (test.status && test.status !== 'published')) return res.status(403).json({ message: 'Test not available' });
    if (test.startTime && new Date(test.startTime) > now) return res.status(403).json({ message: 'Test not started yet' });

    const existing = await Submission.findOne({ test: testId, student: req.user._id, submittedAt: null });
    if (existing) {
      return res.json({ submissionId: existing._id });
    }

    const submission = await Submission.create({
      test: testId,
      student: req.user._id,
      startedAt: new Date(),
    });

    res.json({ submissionId: submission._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const submitTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const { answers, submissionId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(testId)) return res.status(400).json({ message: "Invalid test id" });
    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ message: "Test not found" });
    if (!test.assignedStudents.map(String).includes(String(req.user._id))) return res.status(403).json({ message: "Not assigned this test" });

    // respect publishing, scheduling and attempt rules
    const now = new Date();
    if (!test.isPublished || (test.status && test.status !== 'published')) return res.status(403).json({ message: 'Test not available' });
    if (test.startTime && new Date(test.startTime) > now) return res.status(403).json({ message: 'Test not started yet' });

    // const attemptsCount = await Submission.countDocuments({ test: testId, student: req.user._id });
    // const maxAttempts = test.attemptRules?.maxAttempts ?? 1;
    // if (attemptsCount >= maxAttempts) return res.status(403).json({ message: 'Maximum attempts reached' });

    // Load correct answers
    const questionIds = (answers || []).map(a => a.question).filter(id => mongoose.Types.ObjectId.isValid(id));
    const questions = await Question.find({ _id: { $in: questionIds } });

    // compute score
    let correct = 0;
    let score = 0;
    for (const ans of (answers || [])) {
      const q = questions.find(x => x._id.toString() === ans.question);
      if (q && q.correctOption === ans.selected) {
        score += q.mark || 1; // default 1 mark if not specified
        correct++;
      }
    }
    const wrong = (answers || []).length - correct;
    // const score = questions.length ? (correct / questions.length) * 100 : 0;

    if (!mongoose.Types.ObjectId.isValid(submissionId)) return res.status(400).json({ message: "Invalid submission id" });
    const submission = await Submission.findOne({ _id: submissionId, test: testId, student: req.user._id });
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    submission.answers = answers;
    submission.correct = correct;
    submission.wrong = wrong;
    submission.score = score;
    submission.timeTakenInSeconds = Math.floor((new Date() - submission.startedAt) / 1000);
    submission.submittedAt = new Date();
    await submission.save();

    res.json({ message: "Submitted", submittedId: submission._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const viewResult = async (req, res) => {
  try {
    const { testId, submittedID } = req.params;
    if (!mongoose.Types.ObjectId.isValid(testId)) return res.status(400).json({ message: "Invalid test id" });
    if (!mongoose.Types.ObjectId.isValid(submittedID)) return res.status(400).json({ message: "Invalid submission id" });
    const submission = await Submission
                      .findOne({
                        test: testId,
                        student: req.user._id
                      })
                      .sort({ submittedAt: -1 }) // latest submitted one
                      .populate("test", "totalMarks")
                      .populate("answers.question");
    if (!submission) return res.status(404).json({ message: "Result not found" });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSubmissions = async (req, res) => {
  try {
    const { testId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(testId)) return res.status(400).json({ message: "Invalid test id" });
    const submissions = await Submission.find({ student: req.user._id, test: testId })
      .populate({
          path: 'test',
          select: 'title description subject totalMarks passPercentage',
        })
      .populate({
          path: 'answers.question',
          select: 'questionText options correctOption'
        })
      .sort({ submittedAt: -1 });
    const result = submissions.map(submission => {
      const passPercentage = submission.test.passPercentage || 50;
      const totalMarks = submission.test?.totalMarks || 0;
      const passed = totalMarks > 0 ? Math.round((submission.score / totalMarks) * 100) >= passPercentage : false;
      return {
        ...submission.toObject(),
        result: passed ? 'Pass' : 'Fail',
      }
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
