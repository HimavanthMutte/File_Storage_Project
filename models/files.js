import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        file_name: {
            type: String,
            required: true,
        },
        file_key: {
            type: String,
            required: true,
        },
        file_size: {
            type: Number,
            required: true,
        },
        mime_type: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("File", fileSchema);