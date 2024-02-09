import asyncHandler from "express-async-handler";
import { body } from "express-validator";
import jwt from "jsonwebtoken";

import sendResponse from "../utils/sendResponse.js";
import checkBodyValidationError from "../utils/checkBodyValidationError.js";
import {
    validateUsername,
    validatePassword,
} from "../../../utils/validateCreateAccountFields.js";
import validateUserCredentials from "../utils/validateUserCredentials.js";

const validateFields = [
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
];

export const loginPost = [
    validateFields,
    checkBodyValidationError,
    asyncHandler(async (req, res, next) => {
        const [status, user, message] = await validateUserCredentials(
            req.body.username,
            req.body.password
        );
        if (!status) return sendResponse(res, 401, message);
        jwt.sign(
            {
                username: req.body.username,
                password: req.body.password,
            },
            process.env.AUTH_SECRET_KEY,
            { expiresIn: "7d" },
            (err, token) => {
                if (err) {
                    sendResponse(
                        res,
                        500,
                        `Token creation failed, but log-in attempt was
                        successful. Please try again.`,
                        null,
                        err
                    );
                } else {
                    sendResponse(res, 302, "Log-in successful.", {
                        token: token,
                    });
                }
            }
        );
    }),
];
