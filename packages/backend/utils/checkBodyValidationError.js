import { validationResult } from "express-validator";

import sendResponse from "./sendResponse.js";

const compileValidationErrors = (arr) => {
    const reducedErrorArray = [];
    arr.forEach((error) => {
        reducedErrorArray.push(error.msg);
    });
    return reducedErrorArray.join(", ");
};

const checkBodyValidationError = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorString = compileValidationErrors(errors.array());
        return sendResponse(
            res,
            400,
            `Cannot complete request due to invalid fields: ${errorString}`
        );
    }
    return next();
};

export default checkBodyValidationError;
