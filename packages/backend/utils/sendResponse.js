const sendResponse = (
    res,
    status = 500,
    message = "",
    data = null,
    err = null
) => {
    if (process.env.NODE_ENV === "development") {
        return res.status(status).send({
            status: status || err.status,
            stack: err.stack || "",
            message: message,
            data: null,
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
