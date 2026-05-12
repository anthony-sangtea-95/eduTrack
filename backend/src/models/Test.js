import mongoose from "mongoose";

const testSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    dueDate: Date,

    durationMinutes: {
      type: Number,
      required: true,
    },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedStudents: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],

    questions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    ],

    // ✅ NEW (important for admin control)
    isPublished: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "draft",
    },

    startTime: Date,

    // ✅ optional but useful for scoring system
    totalMarks: {
      type: Number,
      default: 0,
    },

    // ✅ controls student behavior
    attemptRules: {
      allowRetake: {
        type: Boolean,
        default: false,
      },
      maxAttempts: {
        type: Number,
        default: 1,
      },
    },
  },
  { timestamps: true }
);

testSchema.virtual("totalQuestions").get(function () {
  return this.questions?.length || 0;
});

testSchema.set("toJSON", { virtuals: true });
testSchema.set("toObject", { virtuals: true });

const Test = mongoose.model("Test", testSchema); 
export default Test