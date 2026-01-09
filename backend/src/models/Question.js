import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
    {
        test: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Test",
            default: null,
        },

        questionText: {
            type: String,
            required: true,
        },

        options: {
            a: { type: String, required: true },
            b: { type: String, required: true },
            c: { type: String, required: true },
            d: { type: String, required: true },
        },

        correctOption: {
            type: String,
            enum: ["a", "b", "c", "d"],
            required: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        allowedTeachers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);
export default Question;
