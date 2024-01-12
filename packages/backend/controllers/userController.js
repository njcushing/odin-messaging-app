import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import { body, param } from "express-validator";
import passport from "passport";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import User from "../models/user.js";
import Chat from "../models/chat.js";

import sendResponse from "../utils/sendResponse.js";
import checkRequestValidationError from "../utils/checkRequestValidationError.js";
import protectedRouteJWT from "../utils/protectedRouteJWT.js";
import generateToken from "../utils/generateToken.js";
import {
    validateUsername,
    validateEmail,
    validatePassword,
} from "../../../utils/validateCreateAccountFields.js";

const validateUserId = (res, next, userId) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(sendResponse(res, 400, "User credentials are invalid."));
    }
};

const userNotFound = (res, userId) => {
    return sendResponse(res, 404, "User not found in database.");
};

const userPostValidateFields = [
    body("username")
        .trim()
        .custom((value, { req, loc, path }) => {
            const validUsername = validateUsername(value);
            if (!validUsername.status) {
                throw new Error(validUsername.message.back);
            } else {
                return value;
            }
        })
        .escape(),
    body("email")
        .trim()
        .custom((value, { req, loc, path }) => {
            const validEmail = validateEmail(value);
            if (!validEmail.status) {
                throw new Error(validEmail.message.back);
            } else {
                return value;
            }
        })
        .escape()
        .normalizeEmail({ all_lowercase: true }),
    body("password")
        .trim()
        .custom((value, { req, loc, path }) => {
            const validPassword = validatePassword(value);
            if (!validPassword.status) {
                throw new Error(validPassword.message.back);
            } else {
                return value;
            }
        })
        .escape(),
    body("confirmPassword")
        .trim()
        .custom((value, { req, loc, path }) => {
            const validPassword = validatePassword(value, true);
            if (!validPassword.status) {
                throw new Error(validPassword.message.back);
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
        })
        .escape(),
];

export const userGet = [
    param("username", "'username' parameter (String) must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    checkRequestValidationError,
    asyncHandler(async (req, res, next) => {
        let user = await User.findOne({ username: req.params.username })
            .select("_id username preferences")
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
    userPostValidateFields,
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
    param("username", "'username' parameter (String) must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    checkRequestValidationError,
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);

        let user = await User.findById(req.user._id).select("username").exec();
        if (user === null) return userNotFound(res, next, req.user._id);

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

export const friendGet = [
    protectedRouteJWT,
    param("username", "'username' parameter (String) must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    checkRequestValidationError,
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);

        const username = req.params.username;

        const friend = await User.findOne({ username: username }).exec();
        if (friend === null) return userNotFound(res, next, username);

        const user = await User.findOne(
            {
                _id: req.user._id,
            },
            {
                friends: {
                    $elemMatch: {
                        user: {
                            $in: [friend._id],
                        },
                    },
                },
            }
        );
        if (user === null) return userNotFound(res, next, req.user._id);

        await User.populate(user, { path: "friends.user" });

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

        await User.populate(user, {
            path: "friends.user",
            select: `
                _id
                username
                preferences.displayName
                preferences.tagLine
                preferences.setStatus
                email
                status
            `,
        });

        const friendInfo = user.friends[0];
        const friendReduced = {
            _id: friendInfo.user._id,
            username: friendInfo.user.username,
            email: friendInfo.user.email,
            displayName: friendInfo.user.preferences.displayName,
            tagLine: friendInfo.user.preferences.tagLine,
            status:
                friendInfo.user.preferences.setStatus !== null
                    ? friendInfo.user.preferences.setStatus
                    : friendInfo.user.status,
            chat: friendInfo.user.chat,
            friendStatus: friendInfo.user.friendStatus,
            becameFriendsDate: friendInfo.user.becameFriendsDate,
        };
        return sendResponse(res, 200, "Friend found.", {
            friend: friendReduced,
            token: token,
        });
    }),
];

export const friendCanBeAdded = [
    protectedRouteJWT,
    param("username", "'username' parameter (String) must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    checkRequestValidationError,
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);

        const username = req.params.username;

        let friend = await User.findOne({ username: username })
            .select("_id username friendRequests")
            .populate({
                path: "friendRequests",
                select: "_id",
                match: { _id: req.user._id },
            })
            .exec();
        if (friend === null) return userNotFound(res, next, username);

        let user = await User.findById(req.user._id)
            .select("friends.user")
            .exec();
        if (user === null) return userNotFound(res, next, req.user._id);

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
            },
            token: token,
        });
    }),
];

export const friendsGet = [
    protectedRouteJWT,
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);

        let user = await User.findById(req.user._id)
            .select("friends")
            .populate({
                path: "friends.user",
                select: `
                    _id
                    username
                    preferences.displayName
                    preferences.tagLine
                    preferences.setStatus
                    email
                    status
                `,
            })
            .exec();
        if (user === null) return userNotFound(res, next, req.user._id);

        const token = await generateToken(req.user.username, req.user.password);

        const friends = user.friends.map((friend) => ({
            _id: friend.user._id,
            username: friend.user.username,
            email: friend.user.email,
            displayName: friend.user.preferences.displayName,
            tagLine: friend.user.preferences.tagLine,
            status:
                friend.user.preferences.setStatus !== null
                    ? friend.user.preferences.setStatus
                    : friend.user.status,
            chat: friend.user.chat,
            friendStatus: friend.user.friendStatus,
            becameFriendsDate: friend.user.becameFriendsDate,
        }));

        sendResponse(res, 200, "Friends found.", {
            friends: friends,
            token: token,
        });
    }),
];

export const friendsPost = [
    protectedRouteJWT,
    body("username", "'username' parameter (String) must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    checkRequestValidationError,
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);

        let friend = await User.findOne({ username: req.body.username })
            .select("_id username")
            .exec();
        if (friend === null) {
            return userNotFound(res, next, req.body.username);
        }

        let user = await User.findById(req.user._id)
            .select("friends.user")
            .populate({
                path: "friendRequests",
                select: "_id",
                match: { _id: friend._id },
            })
            .exec();
        if (user === null) return userNotFound(res, next, req.user._id);

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
                $push: { friendRequests: user._id },
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
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);
        let user = await User.findById(req.user._id)
            .select("friendRequests")
            .populate({
                path: "friendRequests",
                select: `
                    _id
                    username
                    preferences.tagLine
                `,
            })
            .exec();
        if (user === null) {
            userNotFound(res, next, req.user._id);
        } else {
            const token = await generateToken(
                req.user.username,
                req.user.password
            );
            sendResponse(res, 200, "Friend requests found.", {
                friendRequests: [...user.friendRequests],
                token: token,
            });
        }
    }),
];

export const friendRequestsAccept = [
    protectedRouteJWT,
    param("username", "'username' parameter (String) must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
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
        if (user === null) return userNotFound(res, next, req.user._id);

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
    param("username", "'username' parameter (String) must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
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
        if (user === null) return userNotFound(res, next, req.user._id);

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
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);
        let user = await User.findById(req.user._id).exec();
        if (user === null) return userNotFound(res, next, req.user._id);

        const token = await generateToken(req.user.username, req.user.password);

        if (!userAuthorised) {
            return sendResponse(
                res,
                401,
                "User is not authorised to view this chat.",
                { chat: null, token: token }
            );
        }

        sendResponse(res, 200, "Chat found.", { chat: chat, token: token });
    }),
];
