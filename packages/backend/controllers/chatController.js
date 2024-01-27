import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import { body, param, query } from "express-validator";

import User from "../models/user.js";
import Chat from "../models/chat.js";
import Message from "../models/message.js";

import sendResponse from "../utils/sendResponse.js";
import checkRequestValidationError from "../utils/checkRequestValidationError.js";
import protectedRouteJWT from "../utils/protectedRouteJWT.js";
import generateToken from "../utils/generateToken.js";

const validateUserId = (res, next, userId) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(
            sendResponse(res, 400, `User credentials are invalid: ${userId}`)
        );
    }
};

const validateChatId = (res, next, chatId) => {
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return next(
            sendResponse(
                res,
                400,
                `Provided chat id is not a valid id: ${chatId}`
            )
        );
    }
};

const selfNotFound = (res, next, userId) => {
    return sendResponse(res, 401, "User not found in database.");
};

const userNotFound = (res, userId) => {
    return sendResponse(res, 404, `User not found in database: ${userId}`);
};

const chatNotFound = (res, chatId) => {
    return sendResponse(res, 404, `Chat not found in database: ${chatId}`);
};

const validators = {
    body: {
        participants: body("participants").custom(
            (value, { req, loc, path }) => {
                if (!Array.isArray(value)) {
                    throw new Error(
                        `'participants' field must be of type Array, got 
                    ${typeof participants}`
                    );
                }
                if (value.length === 0) {
                    throw new Error(
                        `'participants' field (Array) must not be empty`
                    );
                }
                for (let i = 0; i < value.length; i++) {
                    if (!mongoose.Types.ObjectId.isValid(value[i])) {
                        throw new Error(
                            `'participants' field (Array) must only contain valid
                        MongoDB ObjectId's, got ${value[i]} at index ${i}`
                        );
                    }
                }
                return value;
            }
        ),
        messageText: body(
            "messageText",
            "'messageText' field (String) must not be empty"
        )
            .trim()
            .isLength({ min: 1, max: 1000 }),
        messageReplyingTo: body("messageReplyingTo")
            .optional({ nullable: true })
            .custom((value, { req, loc, path }) => {
                if (value && !mongoose.Types.ObjectId.isValid(value)) {
                    throw new Error(
                        `'messageReplyingTo' field (String), when not empty, must be
                        a valid MongoDB ObjectId.`
                    );
                }
                return value;
            }),
    },
    param: {
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
        firstMessage: query("firstMessage")
            .trim()
            .custom((value, { req, loc, path }) => {
                if (isNaN(value)) {
                    throw new Error(
                        "'firstMessage' field (Number) must be a valid numeric value."
                    );
                }
                value = parseInt(value);
                if (!Number.isInteger(value)) {
                    throw new Error(
                        "'firstMessage' field (Number) must be an integer."
                    );
                }
                if (value < 0) {
                    throw new Error(
                        "'firstMessage' field (Number) must be greater than or equal to 0."
                    );
                }
                return value;
            }),
        lastMessage: query("lastMessage")
            .trim()
            .custom((value, { req, loc, path }) => {
                if (isNaN(value)) {
                    throw new Error(
                        "'lastMessage' field (Number) must be a valid numeric value."
                    );
                }
                value = parseInt(value);
                if (!Number.isInteger(value)) {
                    throw new Error(
                        "'lastMessage' field (Number) must be an integer."
                    );
                }
                if (value < 0) {
                    throw new Error(
                        "'lastMessage' field (Number) must be greater than or equal to 0."
                    );
                }
                return value;
            }),
    },
};

export const chatGet = [
    protectedRouteJWT,
    validators.query.firstMessage,
    validators.query.lastMessage,
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);

        validateChatId(res, next, req.params.chatId);

        const { firstMessage, lastMessage } = req.query;

        const chat = await Chat.findOne(
            { _id: req.params.chatId },
            {
                messages: {
                    $slice: [
                        Math.max(0, firstMessage),
                        Math.max(0, lastMessage - firstMessage),
                    ],
                },
            }
        )
            .select("-createdAt -updatedAt")
            .populate([
                {
                    path: "participants",
                    populate: {
                        path: "user",
                        select: `
                            username
                            preferences.displayName
                            preferences.tagLine
                            preferences.profileImage
                            preferences.setStatus
                            status
                        `,
                        populate: {
                            path: "preferences.profileImage",
                        },
                    },
                },
                {
                    path: "messages",
                    populate: {
                        path: "replyingTo",
                        populate: {
                            path: "author",
                            select: "username preferences.displayName",
                        },
                    },
                },
            ])
            .exec();
        if (chat === null) return chatNotFound(res, next, req.user._id);

        const token = await generateToken(req.user.username, req.user.password);

        let user = await User.findById(req.user._id)
            .select("chats")
            .populate({
                path: "chats",
                select: "_id",
                match: { _id: chat._id },
            })
            .exec();
        if (user === null) {
            return sendResponse(
                res,
                404,
                "Currently logged-in user either not found in the database or the chat requested cannot be found in the user's chats",
                { chat: null, token: token }
            );
        }

        sendResponse(res, 200, "Chat found.", { chat: chat, token: token });
    }),
];

export const chatPost = [
    protectedRouteJWT,
    validators.body.participants,
    checkRequestValidationError,
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);
        let user = await User.findById(req.user._id).exec();
        if (user === null) return selfNotFound(res, next, req.user._id);

        const token = await generateToken(req.user.username, req.user.password);

        // Validate that all participants are actual users within database
        let invalidParticipant = false;
        await Promise.all(
            req.body.participants.map((participant) => {
                return new Promise(async (resolve, reject) => {
                    const user = await User.findById(participant).exec();
                    if (user === null) {
                        reject(
                            new Error(
                                `User not found in database: ${participant}`
                            )
                        );
                    }
                    resolve(user);
                });
            })
        ).catch((err) => {
            invalidParticipant = true;
        });
        if (invalidParticipant) {
            return sendResponse(
                res,
                400,
                "Not all participants are valid users.",
                { token: token }
            );
        }

        // Ensure all participants are on currently logged-in user's friends list
        const friendIds = user.friends.map((friend) => friend.user.toString());
        for (let i = 0; i < req.body.participants.length; i++) {
            if (!friendIds.includes(req.body.participants[i].toString())) {
                return sendResponse(
                    res,
                    404,
                    `${req.body.participants[i]} is not on the currently
                    logged-in user's friends list`,
                    { token: token }
                );
            }
        }

        // If there is only one participant, check if there is an existing chat
        if (req.body.participants.length === 1) {
            const friend = user.friends.filter(
                (friend) => friend.user.toString() === req.body.participants[0]
            )[0];

            const sessionIndividual = await mongoose.startSession();
            try {
                sessionIndividual.startTransaction();

                let chat = await Chat.findOne({
                    type: "individual",
                    participants: { $size: 2 },
                    "participants.user": { $all: [user._id, friend.user] },
                });
                let existingChat = true;
                if (chat === null) {
                    chat = new Chat({
                        type: "individual",
                        participants: [
                            { user: user._id },
                            { user: friend.user },
                        ],
                    });
                    await chat.save().catch((error) => {
                        error.message = "Unable to create Chat.";
                        error.status = 500;
                        throw error;
                    });
                    existingChat = false;
                }

                const updatedUser = await User.updateOne(
                    { _id: user._id, "friends.user": friend.user },
                    {
                        $set: { "friends.$.chat": chat._id },
                        $addToSet: { chats: chat._id },
                    }
                );
                if (!updatedUser.acknowledged) {
                    const error = new Error(
                        `User not found in database: ${user._id}.`
                    );
                    error.status = 401;
                    throw error;
                }

                const updatedFriend = await User.updateOne(
                    { _id: friend.user, "friends.user": user._id },
                    {
                        $set: { "friends.$.chat": chat._id },
                        $addToSet: { chats: chat._id },
                    }
                );
                if (!updatedFriend.acknowledged) {
                    const error = new Error(
                        `User not found in database: ${friend.user}.`
                    );
                    error.status = 404;
                    throw error;
                }

                sessionIndividual.commitTransaction();

                return sendResponse(
                    res,
                    existingChat ? 409 : 201,
                    `Chat ${
                        existingChat ? "already exists" : "successfully created"
                    } at: ${chat._id}.`,
                    {
                        chatId: chat._id,
                        token: token,
                    }
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
                sessionIndividual.endSession();
            }
        }

        // Create and save new chat for multiple users
        const sessionGroup = await mongoose.startSession();
        try {
            sessionGroup.startTransaction();

            const chat = new Chat({
                type: "group",
                participants: req.body.participants.map((participant) => {
                    return { user: participant };
                }),
            });
            chat.participants.push({
                user: user._id,
                role: "admin", // On chat creation, only creator is admin
            });
            await chat.save().catch((error) => {
                error.message = "Unable to create Chat.";
                error.status = 500;
                throw error;
            });

            await Promise.all(
                chat.participants.map((participant) => {
                    return new Promise(async (resolve, reject) => {
                        let updatedUser = await User.findByIdAndUpdate(
                            participant.user,
                            {
                                $addToSet: { chats: chat._id },
                            }
                        );
                        if (updatedUser === null) {
                            const error = new Error(
                                `User not found in database: ${participant.user}.`
                            );
                            error.status = 404;
                            reject(error);
                        }
                        resolve(user);
                    });
                })
            );

            sessionGroup.commitTransaction();

            sendResponse(
                res,
                201,
                `Chat successfully created at: ${chat._id}.`,
                {
                    chatId: chat._id,
                    token: token,
                }
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
            sessionGroup.endSession();
        }
    }),
];

export const messagePost = [
    protectedRouteJWT,
    validators.body.messageText,
    validators.body.messageReplyingTo,
    checkRequestValidationError,
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);
        const user = await User.findById(req.user._id).exec();
        if (user === null) return selfNotFound(res, next, req.user._id);

        validateChatId(res, next, req.params.chatId);
        const chat = await Chat.findById(req.params.chatId).exec();
        if (chat === null) return chatNotFound(res, next, req.params.chatId);

        const token = await generateToken(req.user.username, req.user.password);

        // Ensure currently logged-in user is a participant in the chat and has
        // the appropriate privileges to post messages
        const userIdString = user._id.toString();
        for (let i = 0; i < chat.participants.length; i++) {
            if (chat.participants[i].user._id.toString() === userIdString) {
                if (chat.participants[i].muted) {
                    return sendResponse(
                        res,
                        403,
                        `Currently logged-in user is muted in the specified chat.`,
                        {
                            message: null,
                            token: token,
                        }
                    );
                }
                break;
            }
            if (i === chat.participants.length - 1) {
                return sendResponse(
                    res,
                    403,
                    `Currently logged-in user is not a participant in the specified chat.`,
                    {
                        message: null,
                        token: token,
                    }
                );
            }
        }

        // Create and save new message
        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            const message = new Message({
                author: user._id,
                text: req.body.messageText,
                replyingTo: req.body.messageReplyingTo,
            });
            await message.save().catch((error) => {
                error.message = "Unable to create Message.";
                error.status = 500;
                throw error;
            });

            if (req.body.messageReplyingTo !== null) {
                await Message.populate(message, {
                    path: "replyingTo",
                    populate: {
                        path: "author",
                        select: "username preferences.displayName",
                    },
                });
            }

            const updatedChat = await Chat.findByIdAndUpdate(chat._id, {
                $push: {
                    messages: {
                        $each: [message._id],
                        $position: 0,
                    },
                },
            });
            if (updatedChat === null) {
                const error = new Error(
                    `Chat not found in database: ${chat._id}.`
                );
                error.status = 404;
                throw error;
            }

            session.commitTransaction();

            sendResponse(
                res,
                201,
                `Message successfully created at: ${message._id} in chat ${chat._id}.`,
                {
                    message: message,
                    token: token,
                }
            );
        } catch (error) {
            return sendResponse(
                res,
                error.status,
                error.message,
                {
                    message: null,
                    token: token,
                },
                error
            );
        } finally {
            session.endSession();
        }
    }),
];

export const addFriendsPost = [
    protectedRouteJWT,
    validators.body.participants,
    checkRequestValidationError,
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);
        let user = await User.findById(req.user._id).exec();
        if (user === null) return selfNotFound(res, next, req.user._id);

        validateChatId(res, next, req.params.chatId);
        let chat = await Chat.findById(req.params.chatId).exec();
        if (chat === null) return chatNotFound(res, next, req.params.chatId);

        const token = await generateToken(req.user.username, req.user.password);

        // Validate that all participants are actual users within database
        let invalidParticipant = false;
        await Promise.all(
            req.body.participants.map((participant) => {
                return new Promise(async (resolve, reject) => {
                    const user = await User.findById(participant).exec();
                    if (user === null) {
                        reject(
                            new Error(
                                `User not found in database: ${participant}`
                            )
                        );
                    }
                    resolve(user);
                });
            })
        ).catch((err) => {
            invalidParticipant = true;
        });
        if (invalidParticipant) {
            return sendResponse(
                res,
                400,
                "Not all participants are valid users.",
                {
                    chatId: null,
                    token: token,
                }
            );
        }

        // Ensure all participants are on currently logged-in user's friends list
        // Filter the participants to ensure no duplicate users will be added
        const friendIds = user.friends.map((friend) => friend.user.toString());
        const participantIds = chat.participants.map((participant) =>
            participant.user.toString()
        );
        const friendsFiltered = [];
        for (let i = 0; i < req.body.participants.length; i++) {
            const participantIdString = req.body.participants[i].toString();
            if (!friendIds.includes(participantIdString)) {
                return sendResponse(
                    res,
                    404,
                    `${req.body.participants[i]} is not on the currently
                    logged-in user's friends list`,
                    {
                        chatId: null,
                        token: token,
                    }
                );
            }
            if (!participantIds.includes(participantIdString)) {
                friendsFiltered.push(req.body.participants[i]);
            }
        }
        if (friendsFiltered.length === 0) {
            return sendResponse(
                res,
                400,
                "All of the specified users are already in the chat.",
                {
                    chatId: null,
                    token: token,
                }
            );
        }

        // Ensure currently logged-in user is a member of the chat
        if (!participantIds.includes(user._id.toString())) {
            return sendResponse(
                res,
                403,
                `$The currently logged-in user is forbidden from adding friends
                to this chat.`,
                {
                    chatId: null,
                    token: token,
                }
            );
        }

        // Check currently logged-in user's privileges ('group'-type chats only)
        if (chat.type === "group") {
            const userInChatInfo = chat.participants.find(
                (participant) =>
                    participant.user.toString() === user._id.toString()
            );
            if (
                userInChatInfo.role !== "admin" &&
                userInChatInfo.role !== "moderator"
            ) {
                return sendResponse(
                    res,
                    403,
                    `$The currently logged-in user does not have the authority to
                    perform this operation on this chat.`,
                    {
                        chatId: null,
                        token: token,
                    }
                );
            }
        }

        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            let chatId = chat._id;

            // If this is an 'individual' chat, duplicate the existing chat and make it a 'group' chat
            if (chat.type === "individual") {
                const newChatId = new mongoose.Types.ObjectId();
                const newChat = new Chat({
                    _id: newChatId,
                    type: "group",
                    participants: [...chat.participants],
                });

                // Set currently logged-in user as admin of new chat
                const userInChatInfo = newChat.participants.find(
                    (participant) =>
                        participant.user.toString() === user._id.toString()
                );
                userInChatInfo.role = "admin";

                // Add new chat _id to existing participants' 'chats' arrays
                const existingParticipantsIds = chat.participants.map(
                    (participant) => {
                        return participant.user.toString();
                    }
                );
                await User.updateMany(
                    { _id: { $in: existingParticipantsIds } },
                    { $addToSet: { chats: newChatId } }
                ).catch((error) => {
                    error.message =
                        "Unable to add new chat to existing participants' chats.";
                    error.status = 500;
                    throw error;
                });

                await newChat.save().catch((error) => {
                    error.message =
                        "Unable to save duplicate of 'individual'-type chat.";
                    error.status = 500;
                    throw error;
                });

                chatId = newChatId;
            }

            // Add new chat _id to other users' 'chats' arrays
            await User.updateMany(
                { _id: { $in: friendsFiltered } },
                { $addToSet: { chats: chatId } }
            ).catch((error) => {
                error.message =
                    "Unable to add new chat to newly-added participants' chats.";
                error.status = 500;
                throw error;
            });

            // Add new participants to chat
            const friendsObjects = friendsFiltered.map((friendStringId) => {
                return { user: new mongoose.Types.ObjectId(friendStringId) };
            });
            await Chat.findByIdAndUpdate(chatId, {
                $push: { participants: { $each: friendsObjects } },
            }).catch((error) => {
                error.message =
                    "Unable to add new participants to chat's participants.";
                error.status = 500;
                throw error;
            });

            session.commitTransaction();

            sendResponse(
                res,
                201,
                `Friend${
                    friendsFiltered.length > 1 ? "s" : ""
                } successfully added to chat at: ${chatId}.`,
                {
                    chatId: chatId,
                    token: token,
                }
            );
        } catch (error) {
            return sendResponse(
                res,
                error.status,
                error.message,
                {
                    chatId: null,
                    token: token,
                },
                error
            );
        } finally {
            session.endSession();
        }
    }),
];
