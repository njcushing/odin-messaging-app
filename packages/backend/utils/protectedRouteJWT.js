import createError from "http-errors";
import passport from "passport";

const protectedRouteJWT = (req, res, next) => {
    passport.authenticate(
        "jwt",
        { session: false },
        (err, success, options) => {
            if (err) {
                return next(
                    createError(500, `Something went wrong with your request.`)
                );
            }
            if (success) {
                return next();
            }
            if (options && options.message) {
                return next(createError(401, options.message));
            }
        }
    )(req, res, next);
};

export default protectedRouteJWT;
