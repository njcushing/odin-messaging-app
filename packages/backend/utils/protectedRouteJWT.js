import passport from "passport";

import sendResponse from "./sendResponse.js";

const protectedRouteJWT = (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user, options) => {
        if (user) {
            return next();
        } else if (options && options.message) {
            return next(sendResponse(res, 401, "Invalid credentials."));
        } else {
            return next(
                sendResponse(
                    res,
                    500,
                    "Something went wrong with your request."
                )
            );
        }
    })(req, res, next);
};

export default protectedRouteJWT;
