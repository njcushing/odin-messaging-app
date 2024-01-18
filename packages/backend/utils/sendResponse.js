const sendResponse = (
    res,
    status = 500,
    message = "",
    data = null,
    err = null
) => {
    if (process.env.NODE_ENV === "development") {
        let statusValue = 500;
        if (Number.isInteger(status)) {
            statusValue = status;
        } else if (
            err &&
            typeof err.status !== "undefined" &&
            Number.isInteger(err.status)
        ) {
            statusValue = err.status;
        }

        let stackString = "";
        if (err && typeof err.stack === "string") {
            stackString = err.stack;
        }

        return res.status(status).send({
            status: statusValue,
            stack: stackString,
            message: message,
            data: data,
        });
    } else {
        return res.status(status).send({
            status: status,
            message: message,
            data: data,
        });
    }
};

export default sendResponse;
