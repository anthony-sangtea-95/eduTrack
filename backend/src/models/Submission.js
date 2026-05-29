import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  selected: { type: String, enum: ["a","b","c","d"], required: true }
});

const submissionSchema = new mongoose.Schema({
  test: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  answers: [answerSchema],
  correct: { type: Number, default: 0 },
  wrong: { type: Number, default: 0 },
  timeTakenInSeconds: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now }
});

const Submission = mongoose.model("Submission", submissionSchema);
export default Submission;
