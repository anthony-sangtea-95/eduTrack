import mongoose from "mongoose";

const testSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: String,
        dueDate: Date,
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
    },
    { timestamps: true }
);

const Test = mongoose.model("Test", testSchema);
export default Test;
