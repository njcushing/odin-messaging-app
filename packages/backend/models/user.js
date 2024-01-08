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
        required: [true, "'password' field required"],
    },
    admin: {
        type: Boolean,
        required: true,
        default: false,
    },
    account_creation_date: { type: Date, default: Date.now },
    friends: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            chat: { type: Schema.Types.ObjectId, ref: "Chat", default: null },
            becameFriendsDate: { type: Date, default: Date.now },
            friendStatus: {
                type: String,
                enum: ["normal", "unfriended"],
                default: "normal",
            },
        },
    ],
    friendRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
    chats: [{ type: Schema.Types.ObjectId, ref: "Chat" }],
    communities: [{ type: Schema.Types.ObjectId, ref: "Community" }],
    status: {
        type: String,
        enum: ["online", "busy", "away", "offline", null],
        default: null,
    },
    preferences: {
        displayName: {
            type: String,
            trim: true,
            maxlength: 40,
            default: "",
        },
        tagLine: {
            type: String,
            trim: true,
            maxlength: 100,
            default: "",
        },
        image: { type: Schema.Types.ObjectId, ref: "Image" },
        setStatus: {
            type: String,
            enum: ["online", "busy", "away", "offline", null],
            default: null,
        },
    },
});

export default mongoose.model("User", UserSchema);
