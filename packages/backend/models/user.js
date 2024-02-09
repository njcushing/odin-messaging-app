import mongoose from "mongoose";

import {
    validateUsername,
    validateEmail,
    validatePassword,
} from "../../../utils/validateCreateAccountFields.js";
import {
    validateDisplayName,
    validateTagLine,
    validateStatus,
    validateProfileImage,
} from "../../../utils/validateUserAccountInformationFields.js";

const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
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
        friends: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                chat: {
                    type: Schema.Types.ObjectId,
                    ref: "Chat",
                    default: null,
                },
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
        preferences: {
            displayName: {
                type: String,
                trim: true,
                validate: {
                    validator: function (value) {
                        return validateDisplayName(value).status;
                    },
                    message: (props) =>
                        validateDisplayName(props.value).message.back,
                },
                default: "",
            },
            tagLine: {
                type: String,
                trim: true,
                validate: {
                    validator: function (value) {
                        return validateTagLine(value).status;
                    },
                    message: (props) =>
                        validateTagLine(props.value).message.back,
                },
                default: "",
            },
            image: { type: Schema.Types.ObjectId, ref: "Image" },
            setStatus: {
                type: String,
                validate: {
                    validator: function (value) {
                        return validateStatus(value).status;
                    },
                    message: (props) =>
                        validateStatus(props.value).message.back,
                },
                default: null,
            },
            theme: {
                type: String,
                default: "default",
            },
        },
    },
    {
        getters: true,
        timestamps: true,
    }
);

UserSchema.virtual("status").get(function () {
    if (this.preferences.setStatus !== null) return this.preferences.setStatus;
    const currentTime = Date.now();
    const secondsSinceLastActivity =
        Math.floor(currentTime - this.updatedAt) / 1000;
    if (secondsSinceLastActivity < 300) return "online";
    return "away";
});

export default mongoose.model("User", UserSchema);
