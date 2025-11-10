import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
    {
        test: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Test",
            required: true,
        },
        questionText: { type: String, required: true },
        options: {
            a: String,
            b: String,
            c: String,
            d: String,
        },
        correctOption: {
            type: String,
            enum: ["a", "b", "c", "d"],
            required: true,
        },
    },
    { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);
export default Question;
