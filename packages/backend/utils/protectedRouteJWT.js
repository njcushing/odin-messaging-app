import createError from "http-errors";
import passport from "passport";

const protectedRouteJWT = (req, res, next) => {
    passport.authenticate(
        "jwt",
        { session: false },
        (err, success, options) => {
            if (success) {
                return next();
            } else if (options && options.message) {
                res.redirect(401, "/log-in");
            } else {
                return next(
                    createError(500, `Something went wrong with your request.`)
                );
            }
        }
    )(req, res, next);
};

export default protectedRouteJWT;
