import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ChatSchema = new Schema({
    linkId: {
        type: String,
        trim: true,
        unique: true,
        required: [true, "'linkId' field required"],
    },
    messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
});

export default mongoose.model("Chat", ChatSchema);
