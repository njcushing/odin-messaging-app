import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ChatSchema = new Schema(
    {
        type: {
            type: String,
            enum: ["individual", "group"],
            require: true,
        },
        participants: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    require: true,
                },
                nickname: { type: String, default: "" },
                role: {
                    type: String,
                    enum: ["admin", "moderator", "guest"],
                    default: "guest",
                },
                muted: { type: Boolean, default: false },
            },
        ],
        name: { type: String, trim: true, default: "" },
        image: { type: Schema.Types.ObjectId, ref: "Image" },
        messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
    },
    {
        getters: true,
        timestamps: true,
    }
);

ChatSchema.set("toObject", { virtuals: true });
ChatSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Chat", ChatSchema);
