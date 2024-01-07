import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import { body, param } from "express-validator";

import User from "../models/user.js";
import Chat from "../models/chat.js";

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
        let user = await User.findById(req.user._id).exec();
        if (user === null) return userNotFound(res, next, req.user._id);

        validateChatId(res, next, req.params.chatId);
        let chat = await Chat.findById(req.params.chatId).exec();
        if (chat === null) return chatNotFound(res, next, req.params.chatId);

        const token = await generateToken(req.user.username, req.user.password);

        let userAuthorised = false;
        for (let i = 0; i < chat.participants.length; i++) {
            if (chat.participants[i].user.toString() === user._id.toString()) {
                userAuthorised = true;
                break;
            }
        }

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

export const chatPost = [
    protectedRouteJWT,
    validators.participants,
    checkRequestValidationError,
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);
        let user = await User.findById(req.user._id).exec();
        if (user === null) return userNotFound(res, next, req.user._id);

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
        const friendIds = user.friends.map((friend) => friend._id.toString());
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

        // If there is only one participant, return the chat for the two users
        if (req.body.participants.length === 1) {
            const friend = user.friends.filter(
                (friend) => friend._id.toString() === req.body.participants[0]
            )[0];
            if (mongoose.Types.ObjectId.isValid(friend.chat)) {
                const chat = await Chat.findById(friend.chat).exec();
                if (chat) {
                    sendResponse(
                        res,
                        409,
                        `Chat already exists at: ${chat._id}.`,
                        {
                            chatId: chat._id,
                            token: token,
                        }
                    );
                } else {
                    return chatNotFound(res, next, friend.chat);
                }
            } else {
                return sendResponse(res, 400, "Bad chat id.", { token: token });
            }
        }

        // Create and save new chat for multiple users
        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            const chat = new Chat({
                participants: req.body.participants.map((participant) => {
                    return { user: participant };
                }),
            });
            chat.participants.push({
                user: user._id,
                role: "admin", // On chat creation, only creator is admin
            });
            await chat.save();

            await Promise.all(
                chat.participants.map((participant) => {
                    return new Promise(async (resolve, reject) => {
                        let updatedUser = await User.findByIdAndUpdate(
                            participant,
                            {
                                $push: { chats: chat._id },
                            }
                        );
                        if (updatedUser === null) {
                            reject(
                                new Error(
                                    `User not found in database: ${participant}`
                                )
                            );
                        }
                        resolve(user);
                    });
                })
            );

            session.commitTransaction();

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
                500,
                "Something went wrong.",
                { token: token },
                error
            );
        } finally {
            session.endSession();
        }
    }),
];
