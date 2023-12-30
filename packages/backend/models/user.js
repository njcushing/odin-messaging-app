import mongoose from "mongoose";

import {
    validateUsername,
    validateEmail,
    validatePassword,
} from "../../../utils/validateCreateAccountFields.js";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        trim: true,
        unique: true,
        validate: {
            validator: function (value) {
                return validateUsername(value).status;
            },
            message: (props) => validateUsername(props.value).message.back,
        },
        required: [true, "'username' field required"],
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        validate: {
            validator: function (value) {
                return validateEmail(value).status;
            },
            message: (props) => validateEmail(props.value).message.back,
        },
        required: [true, "'email' field required"],
    },
    password: {
        type: String,
        trim: true,
        validate: {
            validator: function (value) {
                return validatePassword(value).status;
            },
            message: (props) => validatePassword(props.value).message.back,
        },
        required: [true, "'password' field required"],
    },
    admin: {
        type: Boolean,
        required: true,
        default: false,
    },
    account_creation_date: { type: Date, default: Date.now },
    image: { type: Schema.Types.ObjectId, ref: "Image" },
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    chats: [{ type: Schema.Types.ObjectId, ref: "Chat" }],
    /*
    preferences,
    */
});

export default mongoose.model("User", UserSchema);
