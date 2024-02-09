import mongoose from "mongoose";

import * as validate from "../../../utils/validateMessageFields.js";

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
            validate: {
                validator: function (value) {
                    return validate.text(value).status;
                },
                message: (props) => validate.status(props.value).message.back,
            },
        },
        image: { type: Schema.Types.ObjectId, ref: "Image" },
        replyingTo: { type: Schema.Types.ObjectId, ref: "Message" },
        deleted: { type: Boolean, default: false },
    },
    {
        getters: true,
        timestamps: true,
    }
);

MessageSchema.set("toObject", { virtuals: true });
MessageSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Message", MessageSchema);
