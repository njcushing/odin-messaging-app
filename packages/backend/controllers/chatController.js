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
        return next(sendResponse(res, 400, "User credentials are invalid."));
    }
};

const validateChatId = (res, next, chatId) => {
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return next(
            sendResponse(res, 400, "Provided chat id is not a valid id.")
        );
    }
};

const userNotFound = (res, userId) => {
    return sendResponse(res, 404, "User not found in database.");
};

const chatNotFound = (res, chatId) => {
    return sendResponse(res, 404, "Chat not found in database.");
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
        let chat = await Chat.findById(req.params.chatId);
        if (chat === null) return chatNotFound(res, next, req.params.chatId);

        const token = await generateToken(req.user.username, req.user.password);

        if (!user.chats.includes(req.params.chatId.toString())) {
            sendResponse(
                res,
                401,
                "Currently logged-in user is not authorised to view this chat.",
                {
                    token: token,
                    chat: null,
                }
            );
        } else {
            sendResponse(res, 200, "Chat found.", {
                token: token,
                chat: chat,
            });
        }
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
                    if (user === null)
                        reject(
                            new Error(
                                `User not found in database: ${participant}`
                            )
                        );
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
                "Not all participants could be found in the database.",
                { token: token }
            );
        }

        // Ensure all participants are on currently logged-in user's friends list
        for (let i = 0; i < req.body.participants.length; i++) {
            if (!user.friends.includes(req.body.participants[i].toString())) {
                return sendResponse(
                    res,
                    404,
                    `${req.body.participants[i]} is not on the currently
                    logged-in user's friends list`,
                    { token: token }
                );
            }
        }

        // Create and save new chat
        const chat = new Chat({
            participants: req.body.participants.map((participant) => {
                return { user: participant };
            }),
        });
        chat.participants.push({
            user: user._id,
            role: "admin", // On chat creation, only creator is admin
        });
        await chat
            .save()
            .then(async (chat) => {
                let updatedUser = await User.findByIdAndUpdate(user._id, {
                    $push: { chats: chat._id },
                });
                if (updatedUser === null) {
                    await Chat.findByIdAndDelete(chat._id);
                    return sendResponse(
                        res,
                        401, // Signalling client to re-direct to /log-in instead of sending 404
                        `User not found in database: ${user._id}.`,
                        { token: token }
                    );
                }
                sendResponse(
                    res,
                    201,
                    `Chat successfully created at: ${chat._id}.`,
                    {
                        chatId: chat._id,
                        token: token,
                    }
                );
            })
            .catch((err) => {
                sendResponse(
                    res,
                    500,
                    "Chat could not be created.",
                    { token: token },
                    err
                );
            });
    }),
];
