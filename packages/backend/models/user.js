import mongoose from "mongoose";

import {
    username,
    email,
    password,
    displayName,
    tagLine,
    status,
    profileImage,
} from "../../../utils/validateUserFields.js";

const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        username: {
            type: String,
            trim: true,
            unique: true,
            validate: {
                validator: function (value) {
                    return username(value).status;
                },
                message: (props) => username(props.value).message.back,
            },
            required: [true, "'username' field required"],
        },
        email: {
            type: String,
            trim: true,
            unique: true,
            validate: {
                validator: function (value) {
                    return email(value).status;
                },
                message: (props) => email(props.value).message.back,
            },
            required: [true, "'email' field required"],
        },
        password: {
            type: String,
            trim: true,
            // Not including validator here because the password is hashed
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
                        return displayName(value).status;
                    },
                    message: (props) => displayName(props.value).message.back,
                },
                default: "",
            },
            tagLine: {
                type: String,
                trim: true,
                validate: {
                    validator: function (value) {
                        return tagLine(value).status;
                    },
                    message: (props) => tagLine(props.value).message.back,
                },
                default: "",
            },
            profileImage: {
                type: Schema.Types.ObjectId,
                ref: "Image",
            },
            setStatus: {
                type: String,
                validate: {
                    validator: function (value) {
                        return status(value).status;
                    },
                    message: (props) => status(props.value).message.back,
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

UserSchema.set("toObject", { virtuals: true });
UserSchema.set("toJSON", { virtuals: true });

UserSchema.virtual("status").get(function () {
    if (this.preferences.setStatus !== null) return this.preferences.setStatus;
    const currentTime = Date.now();
    const secondsSinceLastActivity =
        Math.floor(currentTime - this.updatedAt) / 1000;
    if (secondsSinceLastActivity < 300) return "online";
    return "away";
});

export default mongoose.model("User", UserSchema);
