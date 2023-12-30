import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ChatSchema = new Schema({
    participants: [
        {
            user: { type: Schema.Types.ObjectId, ref: "User" },
            role: { type: String, enum: ["admin", "moderator", "guest"] },
            muted: { type: Boolean, default: false },
        },
    ],
    name: { type: String, trim: true },
    image: { type: Schema.Types.ObjectId, ref: "Image" },
    messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
});

export default mongoose.model("Chat", ChatSchema);
