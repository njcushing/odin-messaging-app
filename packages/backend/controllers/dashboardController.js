import asyncHandler from "express-async-handler";
import { body } from "express-validator";
import passport from "passport";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import sendResponse from "../utils/sendResponse.js";
import checkBodyValidationError from "../utils/checkBodyValidationError.js";

export const dashboardGet = [asyncHandler(async (req, res, next) => {})];
