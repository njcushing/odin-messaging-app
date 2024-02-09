import asyncHandler from "express-async-handler";
import { body } from "express-validator";
import passport from "passport";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import sendResponse from "../utils/sendResponse.js";
import checkBodyValidationError from "../utils/checkBodyValidationError.js";
import protectedRouteJWT from "../utils/protectedRouteJWT.js";

export const friendsGet = [
    protectedRouteJWT,
    asyncHandler(async (req, res, next) => {}),
];
