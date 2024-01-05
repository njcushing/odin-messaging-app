import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import { body, param } from "express-validator";
import passport from "passport";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import Chat from "../models/chat.js";

import sendResponse from "../utils/sendResponse.js";
import checkRequestValidationError from "../utils/checkRequestValidationError.js";
import protectedRouteJWT from "../utils/protectedRouteJWT.js";
import generateToken from "../utils/generateToken.js";

export const chatGet = [
    protectedRouteJWT,
    asyncHandler(async (req, res, next) => {
        sendResponse(res, 200, "Chat found.", { chat: {} });
    }),
];
