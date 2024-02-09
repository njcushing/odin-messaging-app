import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import { body } from "express-validator";
import passport from "passport";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import User from "../models/user.js";

import sendResponse from "../utils/sendResponse.js";
import checkBodyValidationError from "../utils/checkBodyValidationError.js";
import protectedRouteJWT from "../utils/protectedRouteJWT.js";
import generateToken from "../utils/generateToken.js";

const validateUserId = (res, next, userId) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(sendResponse(res, 400, "User credentials are invalid."));
    }
};

const userNotFound = (res, next, userId) => {
    return next(sendResponse(res, 404, "User not found in database."));
};

export const friendsGet = [
    protectedRouteJWT,
    asyncHandler(async (req, res, next) => {
        validateUserId(res, next, req.user._id);
        let user = await User.findById(req.user._id).select("friends").exec();
        if (user === null) {
            userNotFound(res, next, req.user._id);
        } else {
            const token = await generateToken(
                req.user.username,
                req.user.password
            );
            sendResponse(res, 200, "Friends found.", {
                friends: [...user.friends],
                token: token,
            });
        }
    }),
];
