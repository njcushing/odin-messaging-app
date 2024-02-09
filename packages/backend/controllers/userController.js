import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import { body, param, query } from "express-validator";
import passport from "passport";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import User from "../models/user.js";
import Chat from "../models/chat.js";
import Message from "../models/message.js";
import Image from "../models/image.js";

import sendResponse from "../utils/sendResponse.js";
import checkRequestValidationError from "../utils/checkRequestValidationError.js";
import protectedRouteJWT from "../utils/protectedRouteJWT.js";
import generateToken from "../utils/generateToken.js";
import {
    username,
    email,
    password,
    displayName,
    tagLine,
    status,
    profileImage,
    theme,
} from "../../../utils/validateUserFields.js";

const validateUserId = (res, next, userId) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(sendResponse(res, 400, "User credentials are invalid."));
    }
};

const selfNotFound = (res, next, userId) => {
    return sendResponse(res, 401, "User not found in database.");
};

const userNotFound = (res, next, userId) => {
    return sendResponse(res, 404, "User not found in database.");
};

const validators = {
    body: {
        username: body("username")
            .trim()
            .custom((value, { req, loc, path }) => {
                const validUsername = username(value);
                if (!validUsername.status) {
                    throw new Error(validUsername.message.back);
                } else {
                    return value;
                }
            }),
        email: body("email")
            .trim()
            .custom((value, { req, loc, path }) => {
                const valid = email(value);
                if (!valid.status) {
                    throw new Error(valid.message.back);
                } else {
                    return value;
                }
            })
            .normalizeEmail({ all_lowercase: true }),
        password: body("password")
            .trim()
            .custom((value, { req, loc, path }) => {
                const valid = password(value);
                if (!valid.status) {
                    throw new Error(valid.message.back);
                } else {
                    return value;
                }
            }),
        confirmPassword: body("confirmPassword")
            .trim()
            .custom((value, { req, loc, path }) => {
                const valid = password(value, true);
                if (!valid.status) {
                    throw new Error(valid.message.back);
                } else {
                    return value;
                }
            })
            .custom((value, { req, loc, path }) => {
                if (value !== req.body.password) {
                    throw new Error(
                        "'password' field (String) and 'confirmPassword' field (String) must match"
                    );
                } else {
                    return value;
                }
            }),
        displayName: body("displayName")
            .trim()
            .custom((value, { req, loc, path }) => {
                const valid = displayName(value);
                if (!valid.status) {
                    throw new Error(valid.message.back);
                } else {
                    return value;
                }
            })
            .optional({ values: "falsy" }),
        tagLine: body("tagLine")
            .trim()
            .custom((value, { req, loc, path }) => {
                const valid = tagLine(value);
                if (!valid.status) {
                    throw new Error(valid.message.back);
                } else {
                    return value;
                }
            })
            .optional({ values: "falsy" }),
        profileImage: body("profileImage")
            .trim()
            .custom((value, { req, loc, path }) => {
                const valid = profileImage(value);
                if (!valid.status) {
                    throw new Error(valid.message.back);
                } else {
                    return value;
                }
            }),
        setStatus: body("setStatus")
            .trim()
            .custom((value, { req, loc, path }) => {
                const valid = status(value);
                if (!valid.status) {
                    throw new Error(valid.message.back);
                } else {
                    return value;
                }
            })
            .optional({ nullable: true }),
        theme: body("theme")
            .trim()
            .custom((value, { req, loc, path }) => {
                const valid = theme(value);
                if (!valid.status) {
                    throw new Error(valid.message.back);
                } else {
                    return value;
                }
            }),
    },
    param: {
        username: param("username")
            .trim()
            .custom((value, { req, loc, path }) => {
                const validUsername = username(value);
                if (!validUsername.status) {
                    throw new Error(validUsername.message.back);
                } else {
                    return value;
                }
            }),
        page: param("page")
            .trim()
            .custom((value, { req, loc, path }) => {
                if (isNaN(value)) {
                    throw new Error(
                        "'page' field (Number) must be a valid numeric value."
                    );
                }
                value = parseInt(value);
                if (!Number.isInteger(value)) {
                    throw new Error(
                        "'page' field (Number) must be an integer."
                    );
                }
                if (value < 0) {
                    throw new Error(
                        "'page' field (Number) must be greater than or equal to 0."
                    );
                }
                return value;
            }),
    },
    query: {
        first: query("first")
            .trim()
            .custom((value, { req, loc, path }) => {
                if (isNaN(value)) {
                    throw new Error(
                        "'first' field (Number) must be a valid numeric value."
                    );
                }
                value = parseInt(value);
                if (!Number.isInteger(value)) {
                    throw new Error(
                        "'first' field (Number) must be an integer."
                    );
                }
                if (value < 0) {
                    throw new Error(
                        "'first' field (Number) must be greater than or equal to 0."
                    );
                }
                return value;
            }),
        last: query("last")
            .trim()
            .custom((value, { req, loc, path }) => {
                if (isNaN(value)) {
                    throw new Error(
                        "'last' field (Number) must be a valid numeric value."
                    );
                }
                value = parseInt(value);
                if (!Number.isInteger(value)) {
                    throw new Error(
                        "'last' field (Number) must be an integer."
                    );
                }
                if (value < 0) {
                    throw new Error(
                        "'last' field (Number) must be greater than or equal to 0."
                    );
                }
                return value;
            }),
    },
};

export const userGet = [
    param("username", "'username' parameter (String) must not be empty")
        .trim()
        .isLength({ min: 1 }),
    checkRequestValidationError,
    asyncHandler(async (req, res, next) => {
        let user = await User.findOne({ username: req.params.username })
            .select("_id username preferences")
            .populate("preferences.profileImage")
            .exec();
        if (user === null) {
            userNotFound(res, next, req.param.username);
        } else {
            const extractUserFields = {
                username: user.username,
                preferences: {
                    displayName: user.preferences.displayName,
                    tagLine: user.preferences.tagLine,
                },
            };
            sendResponse(res, 200, "User found.", { user: extractUserFields });
        }
    }),
];

export const userPost = [
    validators.body.username,
    validators.body.email,
    validators.body.password,
    validators.body.confirmPassword,
    checkRequestValidationError,
    asyncHandler(async (req, res, next) => {
        bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
            if (err) {
                sendResponse(
                    res,
                    500,
                    "Something went wrong - please try again.",
                    null,
                    err
                );
            } else {
                const user = new User({
                    username: req.body.username,
                    email: req.body.email,
                    password: hashedPassword,
                    admin: false,
                });
                await user
                    .save()
                    .then((user) => {
                        jwt.sign(
                            {
                                username: user.username,
                                password: req.body.password,
                            },
                            process.env.AUTH_SECRET_KEY,
                            { expiresIn: "7d" },
                            (err, token) => {
                                if (err) {
                                    sendResponse(
                                        res,
                                        500,
                                        `Token creation failed. Account was
                                        successfully created - please
                                        log-in manually. Error: ${err}`,
                                        null,
                                        err
                                    );
                                } else {
                                    sendResponse(
                                        res,
                                        201,
                                        "Account created successfully.",
                                        { token: `Bearer ${token}` }
                                    );
                                }
                            }
                        );
                    })
                    .catch((err) => {
                        if (err.code === 11000) {
                            let message =
                                "Credential(s) is/are already in use.";
                            if (err.keyValue.hasOwnProperty("username")) {
                                message = "This username is already in use.";
                            }
                            if (err.keyValue.hasOwnProperty("email")) {
                                message =
                                    "This email is already registered with another account.";
                            }
                            sendResponse(res, 409, message, null, err);
                        } else {
                            /*
                                Should only ever reach here if mongoose User
                                model field validation differs from req.body
                                validation, which should never be the case
                            */
                            sendResponse(
                                res,
                                500,
                                "Credentials invalid - please try again.",
                                null,
                                err
                            );
                        }
                    });
            }
        });
    }),
];

export const userSelf = [
    protectedRouteJWT,
    validators.param.username,
    checkRequestValidationError,
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);

        let user = await User.findById(req.user._id).select("username").exec();
        if (user === null) return selfNotFound(res, next, req.user._id);

        const token = await generateToken(req.user.username, req.user.password);

        if (user.username === req.params.username) {
            return sendResponse(
                res,
                200,
                "Specified user is the currently logged-in user.",
                { token: token }
            );
        }

        sendResponse(
            res,
            400,
            "Specified user is not the currently logged-in user.",
            { token: token }
        );
    }),
];

export const getSelf = [
    protectedRouteJWT,
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);

        let user = await User.findById(req.user._id)
            .select("-password -admin -createdAt -updatedAt")
            .populate("preferences.profileImage")
            .exec();
        if (user === null) return selfNotFound(res, next, req.user._id);

        const token = await generateToken(req.user.username, req.user.password);

        return sendResponse(res, 200, "Currently logged-in user found.", {
            user: user,
            token: token,
        });
    }),
];

export const friendGet = [
    protectedRouteJWT,
    validators.param.username,
    checkRequestValidationError,
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);

        const username = req.params.username;

        const friend = await User.findOne({ username: username }).exec();
        if (friend === null) return userNotFound(res, next, username);

        const user = await User.findOne(
            { _id: req.user._id },
            { friends: { $elemMatch: { user: friend._id } } }
        ).populate({
            path: "friends.user",
            select: `
                _id
                username
                preferences.displayName
                preferences.tagLine
                preferences.profileImage
                preferences.setStatus
                email
                status
            `,
            populate: {
                path: "preferences.profileImage",
            },
        });
        if (user === null) return selfNotFound(res, next, req.user._id);

        const token = await generateToken(req.user.username, req.user.password);

        if (user.friends.length === 0) {
            return sendResponse(
                res,
                400,
                "User found, but is not a friend of the currently logged-in user.",
                {
                    friend: null,
                    token: token,
                }
            );
        }

        return sendResponse(res, 200, "Friend found.", {
            friend: user.friends[0],
            token: token,
        });
    }),
];

export const friendCanBeAdded = [
    protectedRouteJWT,
    checkRequestValidationError,
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);

        const username = req.params.username;

        let friend = await User.findOne({ username: username })
            .select("_id username friendRequests preferences.profileImage")
            .populate([
                {
                    path: "friendRequests",
                    select: "_id",
                    match: { _id: req.user._id },
                },
                {
                    path: "preferences.profileImage",
                },
            ])
            .exec();
        if (friend === null) return userNotFound(res, next, username);

        let user = await User.findById(req.user._id)
            .select("friends.user")
            .exec();
        if (user === null) return selfNotFound(res, next, req.user._id);

        const token = await generateToken(req.user.username, req.user.password);

        // User and friend ids are identical
        if (friend._id.toString() === user._id.toString()) {
            return sendResponse(
                res,
                400,
                "Provided username matches the user currently logged-in.",
                {
                    messageInformal: "You cannot add yourself as a friend.",
                    token: token,
                }
            );
        }

        // User exists within friends list already
        const friendId = friend._id.toString();
        const friendIds = user.friends.map((friend) => friend.user.toString());
        if (friendIds.includes(friendId)) {
            return sendResponse(
                res,
                400,
                "Provided username already exists in the friends list for the currently logged-in user.",
                {
                    messageInformal: `You and ${friend.username} are already friends.`,
                    token: token,
                }
            );
        }

        // User exists within friends' pending friend requests list
        if (friend.friendRequests.length !== 0) {
            return sendResponse(
                res,
                400,
                "Friend request already sent to specified username.",
                {
                    messageInformal: `You have already sent a friend request to ${friend.username}.`,
                    token: token,
                }
            );
        }

        sendResponse(res, 200, `${friend.username} can be added as a friend`, {
            friend: {
                _id: friend._id,
                username: friend.username,
                preferences: {
                    profileImage: friend.preferences.profileImage,
                },
            },
            token: token,
        });
    }),
];

export const friendsGet = [
    protectedRouteJWT,
    validators.query.first,
    validators.query.last,
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);

        const { first, last } = req.query;

        const user = await User.findOne(
            { _id: req.user._id },
            {
                friends: {
                    $slice: [Math.max(0, first), Math.max(0, last - first)],
                },
            }
        )
            .populate({
                path: "friends.user",
                select: `
                    _id
                    username
                    email
                    preferences.displayName
                    preferences.tagLine
                    preferences.profileImage
                    preferences.setStatus
                    status
                `, // Have to include 'setStatus' so the 'status' virtual property will populate
                populate: {
                    path: "preferences.profileImage",
                },
            })
            .exec();
        if (user === null) return selfNotFound(res, next, req.user._id);

        const token = await generateToken(req.user.username, req.user.password);

        sendResponse(res, 200, "Friends found.", {
            friends: user.friends,
            token: token,
        });
    }),
];

export const friendsPost = [
    protectedRouteJWT,
    validators.body.username,
    checkRequestValidationError,
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);

        const username = req.body.username;

        let friend = await User.findOne({ username: username })
            .select("_id username")
            .exec();
        if (friend === null) return userNotFound(res, next, username);

        let user = await User.findById(req.user._id)
            .select("friends.user")
            .populate({
                path: "friendRequests",
                select: "_id",
                match: { _id: friend._id },
            })
            .exec();
        if (user === null) return selfNotFound(res, next, req.user._id);

        const token = await generateToken(req.user.username, req.user.password);

        // User and friend ids are identical
        if (friend._id.toString() === user._id.toString()) {
            return sendResponse(
                res,
                400,
                "Provided username matches the user currently logged-in.",
                { token: token }
            );
        }

        // User exists within friends list already
        const friendId = friend._id.toString();
        const friendIds = user.friends.map((friend) => friend.user.toString());
        if (friendIds.includes(friendId)) {
            return sendResponse(
                res,
                400,
                "Provided username already exists in the friends list for the currently logged-in user.",
                { token: token }
            );
        }

        // User _id exists within currently logged-in user's friendRequests array
        if (user.friendRequests.length !== 0) {
            const session = await mongoose.startSession();
            try {
                session.startTransaction();

                const updatedFriend = await User.findByIdAndUpdate(friend._id, {
                    $push: {
                        friends: {
                            user: user._id,
                        },
                    },
                });
                if (updatedFriend === null) {
                    const error = new Error(
                        `User not found in database: ${friend._id}.`
                    );
                    error.status = 404;
                    throw error;
                }

                const updatedUser = await User.findByIdAndUpdate(user._id, {
                    $push: {
                        friends: {
                            user: friend._id,
                        },
                    },
                    $pull: { friendRequests: friend._id },
                });
                if (updatedUser === null) {
                    const error = new Error(
                        `User not found in database: ${user._id}.`
                    );
                    error.status = 401;
                    throw error;
                }

                session.commitTransaction();

                return sendResponse(
                    res,
                    201,
                    `${friend.username} successfully added as a friend.`,
                    { token: token }
                );
            } catch (error) {
                return sendResponse(
                    res,
                    error.status,
                    error.message,
                    { token: token },
                    error
                );
            } finally {
                session.endSession();
            }
        } else {
            // Add currently logged-in user's _id to friend's pending friendRequest array
            const updatedFriend = await User.findByIdAndUpdate(friend._id, {
                $addToSet: { friendRequests: user._id },
            });
            if (updatedFriend === null) {
                return sendResponse(
                    res,
                    404,
                    `User not found in database: ${friend._id}.`,
                    { token: token }
                );
            }
            sendResponse(
                res,
                201,
                `Friend request sent to ${friend.username}.`,
                {
                    token: token,
                }
            );
        }
    }),
];

export const friendRequestsGet = [
    protectedRouteJWT,
    validators.query.first,
    validators.query.last,
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);

        const { first, last } = req.query;

        const user = await User.findOne(
            { _id: req.user._id },
            {
                friendRequests: {
                    $slice: [Math.max(0, first), Math.max(0, last - first)],
                },
            }
        )
            .populate({
                path: "friendRequests",
                select: `
                    _id
                    username
                    preferences.tagLine
                    preferences.profileImage
                `,
                populate: {
                    path: "preferences.profileImage",
                },
            })
            .exec();
        if (user === null) return selfNotFound(res, next, req.user._id);

        const token = await generateToken(req.user.username, req.user.password);
        sendResponse(res, 200, "Friend requests found.", {
            friendRequests: [...user.friendRequests],
            token: token,
        });
    }),
];

export const friendRequestsAccept = [
    protectedRouteJWT,
    validators.param.username,
    checkRequestValidationError,
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);

        const username = req.params.username;

        let friend = await User.findOne({ username: username })
            .select("_id username")
            .exec();
        if (friend === null) return userNotFound(res, next, username);

        let user = await User.findById(req.user._id)
            .populate({
                path: "friendRequests",
                select: "_id",
                match: { _id: friend._id },
            })
            .exec();
        if (user === null) return selfNotFound(res, next, req.user._id);

        const token = await generateToken(req.user.username, req.user.password);

        if (user.friendRequests.length === 0) {
            return sendResponse(
                res,
                404,
                `${friend.username} does not exist within the currently
                logged-in user's friend requests.`,
                { token: token }
            );
        }

        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            const updatedFriend = await User.findByIdAndUpdate(friend._id, {
                $push: {
                    friends: {
                        user: user._id,
                    },
                },
            });
            if (updatedFriend === null) {
                const error = new Error(
                    `User not found in database: ${friend._id}.`
                );
                error.status = 404;
                throw error;
            }
            const updatedUser = await User.findByIdAndUpdate(user._id, {
                $push: {
                    friends: {
                        user: friend._id,
                    },
                },
                $pull: { friendRequests: friend._id },
            });
            if (updatedUser === null) {
                const error = new Error(
                    `User not found in database: ${user._id}.`
                );
                error.status = 401;
                throw error;
            }

            session.commitTransaction();

            return sendResponse(
                res,
                200,
                `${friend.username} successfully accepted as a friend.`,
                { token: token }
            );
        } catch (error) {
            return sendResponse(
                res,
                error.status,
                error.message,
                { token: token },
                error
            );
        } finally {
            session.endSession();
        }
    }),
];

export const friendRequestsDecline = [
    protectedRouteJWT,
    validators.param.username,
    checkRequestValidationError,
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);

        const username = req.params.username;

        let friend = await User.findOne({ username: username })
            .select("_id username")
            .exec();
        if (friend === null) return userNotFound(res, next, username);

        let user = await User.findById(req.user._id)
            .populate({
                path: "friendRequests",
                select: "_id",
                match: { _id: friend._id },
            })
            .exec();
        if (user === null) return selfNotFound(res, next, req.user._id);

        const token = await generateToken(req.user.username, req.user.password);

        if (user.friendRequests.length === 0) {
            return sendResponse(
                res,
                404,
                `${friend.username} does not exist within the currently
                logged-in user's friend requests.`,
                { token: token }
            );
        }

        const updatedUser = await User.findByIdAndUpdate(user._id, {
            $pull: { friendRequests: friend._id },
        });
        if (updatedUser === null) {
            return sendResponse(
                res,
                401,
                `User not found in database: ${user._id}.`,
                { token: token }
            );
        }
        sendResponse(
            res,
            200,
            `${friend.username} successfully declined as a friend.`,
            { token: token }
        );
    }),
];

export const chatsGet = [
    protectedRouteJWT,
    validators.query.first,
    validators.query.last,
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);

        const { first, last } = req.query;

        const user = await User.aggregate([
            { $match: { _id: req.user._id } },
            {
                $lookup: {
                    from: Chat.collection.name,
                    localField: "chats",
                    foreignField: "_id",
                    as: "chatsInfo",
                },
            },
            { $unwind: "$chatsInfo" },
            { $sort: { "chatsInfo.updatedAt": -1 } },
            { $group: { _id: "$_id", chatsInfo: { $push: "$chatsInfo" } } },
            {
                $project: {
                    chatsInfo: {
                        $slice: [
                            "$chatsInfo",
                            Math.max(0, first),
                            Math.max(0, last - first),
                        ],
                    },
                },
            },
        ]);
        if (user.length === 0) selfNotFound(res, next, req.user._id);

        const chats = await Chat.find(
            { _id: { $in: user[0].chatsInfo } },
            { messages: { $slice: 1 } }
        )
            .sort({ updatedAt: -1 })
            .populate([
                { path: "image" },
                {
                    path: "participants",
                    populate: {
                        path: "user",
                        select: `
                            username
                            preferences.displayName
                            preferences.setStatus
                            status
                        `,
                    },
                },
                { path: "messages" },
            ])
            .exec();

        const token = await generateToken(req.user.username, req.user.password);

        sendResponse(res, 200, "Chats found.", {
            chats: chats,
            token: token,
        });
    }),
];

export const displayNamePut = [
    protectedRouteJWT,
    validators.body.displayName,
    checkRequestValidationError,
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);

        const updatedUser = await User.findByIdAndUpdate(req.user._id, {
            $set: { "preferences.displayName": req.body.displayName },
        });
        if (updatedUser === null) return selfNotFound(res, next, req.user._id);

        const token = await generateToken(req.user.username, req.user.password);

        sendResponse(res, 200, "Display Name successfully updated.", {
            token: token,
        });
    }),
];

export const tagLinePut = [
    protectedRouteJWT,
    validators.body.tagLine,
    checkRequestValidationError,
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);

        const updatedUser = await User.findByIdAndUpdate(req.user._id, {
            $set: { "preferences.tagLine": req.body.tagLine },
        });
        if (updatedUser === null) return selfNotFound(res, next, req.user._id);

        const token = await generateToken(req.user.username, req.user.password);

        sendResponse(res, 200, "Tag Line successfully updated.", {
            token: token,
        });
    }),
];

export const profileImagePut = [
    protectedRouteJWT,
    validators.body.profileImage,
    checkRequestValidationError,
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);

        const user = await User.findById(req.user._id);
        if (user === null) return selfNotFound(res, next, req.user._id);

        const token = await generateToken(req.user.username, req.user.password);

        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            if (user.preferences.profileImage) {
                await Image.findByIdAndDelete(
                    user.preferences.profileImage
                ).catch((error) => {
                    error.message = "Unable to delete existing profile image.";
                    throw error;
                });
            }

            const profileImage = new Image({
                "img.data": req.body.profileImage,
                "img.contentType": "image/png",
            });
            await profileImage.save().catch((error) => {
                error.message = "Unable to save new profile image.";
                throw error;
            });

            const updatedUser = await User.findByIdAndUpdate(req.user._id, {
                $set: { "preferences.profileImage": profileImage._id },
            });
            if (updatedUser === null) {
                return selfNotFound(res, next, req.user._id);
            }

            session.commitTransaction();

            return sendResponse(
                res,
                200,
                "Profile Image successfully updated.",
                { token: token }
            );
        } catch (error) {
            return sendResponse(
                res,
                error.status,
                error.message,
                { token: token },
                error
            );
        } finally {
            session.endSession();
        }
    }),
];

export const setStatusPut = [
    protectedRouteJWT,
    validators.body.setStatus,
    checkRequestValidationError,
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);

        const updatedUser = await User.findByIdAndUpdate(req.user._id, {
            $set: { "preferences.setStatus": req.body.setStatus },
        });
        if (updatedUser === null) return selfNotFound(res, next, req.user._id);

        const token = await generateToken(req.user.username, req.user.password);

        sendResponse(res, 200, "Status successfully updated.", {
            token: token,
        });
    }),
];

export const themePut = [
    protectedRouteJWT,
    validators.body.theme,
    checkRequestValidationError,
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);

        const updatedUser = await User.findByIdAndUpdate(req.user._id, {
            $set: { "preferences.theme": req.body.theme },
        });
        if (updatedUser === null) return selfNotFound(res, next, req.user._id);

        const token = await generateToken(req.user.username, req.user.password);

        sendResponse(res, 200, "Theme successfully updated.", {
            token: token,
        });
    }),
];
