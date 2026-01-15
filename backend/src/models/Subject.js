import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
    {
        subjectName: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

const Subject = mongoose.model("Subject", subjectSchema);
export default Subject;