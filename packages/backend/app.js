import dotenv from "dotenv";
dotenv.config();

import createError from "http-errors";
import express from "express";
import cors from "cors";
import passport from "passport";
import passportLocal from "passport-local";
const LocalStrategy = passportLocal.Strategy;
import passportJWT from "passport-jwt";
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import path from "path";
import logger from "morgan";
import RateLimit from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";

import dbConfig from "./utils/dbConfig.js";
dbConfig();

var app = express();

const limiter = RateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 1000,
});
app.use(limiter);

app.use(helmet());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import validateUserCredentials from "./utils/validateUserCredentials.js";

// Verify current login details
passport.use(
    "local",
    new LocalStrategy(async (username, password, done) => {
        try {
            const [status, user, msg] = await validateUserCredentials(
                username,
                password
            );
            if (!status) return done(null, false, { message: msg });
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    })
);

// Verify token
passport.use(
    "jwt",
    new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.AUTH_SECRET_KEY,
        },
        async (jwt_payload, done) => {
            const { username, password } = jwt_payload;
            try {
                const [status, user, message] = await validateUserCredentials(
                    username,
                    password
                );
                if (!status) return done(null, false, { message: message });
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    )
);

app.use(logger("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(compression());

// CORS config
const trusted_domains = process.env.TRUSTED_DOMAINS || [];
const getCorsOpts = (req, callback) => {
    let corsOpts;
    if (trusted_domains.includes(req.header("Origin"))) {
        corsOpts = { origin: true };
    } else {
        corsOpts = { origin: false };
    }
    callback(null, corsOpts);
};
app.use("*", cors(getCorsOpts));

import * as routes from "./routes/index.js";
app.use("/", routes.index);
app.use("/log-in", routes.login);
app.use("/user", routes.user);
app.use("/chat", routes.chat);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

import sendResponse from "./utils/sendResponse.js";

// error handler
app.use(function (err, req, res, next) {
    sendResponse(res, err.status || 500, err.message, null, err);
});

export default app;
