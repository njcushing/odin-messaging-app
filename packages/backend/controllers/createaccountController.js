import asyncHandler from "express-async-handler";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import User from "../models/user.js";

import sendResponse from "../utils/sendResponse.js";
import checkBodyValidationError from "../utils/checkBodyValidationError.js";
import {
    validateUsername,
    validateEmail,
    validatePassword,
} from "../../../utils/validateCreateAccountFields.js";

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

export const createaccountPost = [
    validateFields,
    checkBodyValidationError,
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
                                password: user.password,
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
