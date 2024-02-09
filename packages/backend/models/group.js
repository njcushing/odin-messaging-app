import mongoose from "mongoose";

const Schema = mongoose.Schema;

const GroupSchema = new Schema({
    participants: [
        {
            user: { type: Schema.Types.ObjectId, ref: "User", require: true },
            role: {
                type: String,
                enum: ["admin", "moderator", "guest"],
                default: "guest",
            },
            muted: { type: Boolean, default: false },
        },
    ],
    name: { type: String, trim: true },
    image: { type: Schema.Types.ObjectId, ref: "Image" },
    messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
});

export default mongoose.model("Group", GroupSchema);
