import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import { body, param } from "express-validator";

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
    participants: body("participants").custom((value, { req, loc, path }) => {
        if (!Array.isArray(value)) {
            throw new Error(
                `'participants' field must be of type Array, got 
                ${typeof participants}`
            );
        }
        if (value.length === 0) {
            throw new Error(`'participants' field (Array) must not be empty`);
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
    }),
};

export const chatGet = [
    protectedRouteJWT,
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);

        validateChatId(res, next, req.params.chatId);
        let chat = await Chat.findOne(
            { _id: req.params.chatId },
            { messages: { $slice: [-50, 50] } }
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
                            preferences.image
                            status
                        `,
                    },
                },
                { path: "messages" },
            ])
            .exec();
        if (chat === null) return chatNotFound(res, next, req.params.chatId);

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
    validators.participants,
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
                            { user: friend._id },
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
