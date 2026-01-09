import mongoose from "mongoose";

const testTypeSchema = new mongoose.Schema(
    {
        typeName: {
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

const TestType = mongoose.model("TestType", testTypeSchema);
export default TestType;