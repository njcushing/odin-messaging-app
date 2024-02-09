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

        validateUserId(res, next, req.params.userId);
        let friend = await User.findById(req.params.userId);
        if (friend === null) return userNotFound(res, next, req.params.userId);

        const token = await generateToken(req.user.username, req.user.password);

        // Check if chat exists
        const [link1, link2] = [
            `${user._id.toString()}${friend._id.toString()}`,
            `${friend._id.toString()}${user._id.toString()}`,
        ];
        let chat;
        chat = await Chat.findOne({ linkId: link1 });
        if (chat === null) await Chat.findOne({ linkId: link2 });
        if (chat === null) {
            sendResponse(res, 404, "Chat not found.", {
                chat: null,
                token: token,
            });
        } else {
            sendResponse(res, 200, "Chat found.", {
                chat: chat,
                token: token,
            });
        }
    }),
];

export const chatPost = [
    protectedRouteJWT,
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);
        let user = await User.findById(req.user._id).exec();
        if (user === null) return userNotFound(res, next, req.user._id);

        validateUserId(res, next, req.params.userId);
        let friend = await User.findById(req.params.userId);
        if (friend === null) return userNotFound(res, next, req.params.userId);

        const token = await generateToken(req.user.username, req.user.password);

        // Check if chat already exists
        const [link1, link2] = [
            `${user._id.toString()}${friend._id.toString()}`,
            `${friend._id.toString()}${user._id.toString()}`,
        ];
        let chat;
        chat = await Chat.findOne({ linkId: link1 });
        if (chat === null) await Chat.findOne({ linkId: link2 });
        if (chat !== null) {
            sendResponse(res, 409, "This chat already exists.", {
                token: token,
                chat: null,
            });
        } else {
            // Create and save new chat
            const chat = new Chat({
                linkId: `${user._id.toString()}${friend._id.toString()}`,
            });
            await chat
                .save()
                .then(async (chat) => {
                    sendResponse(
                        res,
                        201,
                        `Chat successfully created at: ${chat._id}.`,
                        {
                            chat: chat,
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
        }
    }),
];

// Leaving this in for now because I am going to repurpose this code for group creation

/*
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
*/
