import mongoose from "mongoose";

const Schema = mongoose.Schema;

const MessageSchema = new Schema(
    {
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
            trim: true,
            minLength: 1,
            maxLength: 1000,
            required: true,
        },
        replyingTo: { type: Schema.Types.ObjectId, ref: "Message" },
        deleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model("Message", MessageSchema);
