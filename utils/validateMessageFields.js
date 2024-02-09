import mongoose from "mongoose";

export const text = (value) => {
    if (value.length === 0) {
        return {
            status: false,
            message: {
                front: "Your message text must not be empty.",
                back: "'text' field (String) be not be empty",
            },
        };
    }
    if (value.length > 1000) {
        return {
            status: false,
            message: {
                front: "Your message text must be fewer than 1000 characters in length.",
                back: "'text' field (String) be fewer than 1000 characters in length",
            },
        };
    }
    return {
        status: true,
        message: {
            front: "Valid message text.",
            back: "'text' field (String) is valid",
        },
    };
};

export const image = (value) => {
    if (!Array.isArray(value)) {
        return {
            status: false,
            message: {
                front: `Your message image must be an Array.`,
                back: `'image' field must be an Array.`,
            },
        };
    }
    if (value.length > 5000000) {
        return {
            status: false,
            message: {
                front: `Your message image must be smaller than 5MB.`,
                back: `'image' field (Array) must be smaller than 5MB.`,
            },
        };
    }
    return {
        status: true,
        message: {
            front: `Valid message image.`,
            back: `'image' field (Array) is valid`,
        },
    };
};

export const replyingTo = (value) => {
    if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return {
            status: false,
            message: {
                front: `The message you are replying to must be a valid MongoDB ObjectId.`,
                back: `'replyingTo' field must be a valid MongoDB ObjectId`,
            },
        };
    }
    return {
        status: true,
        message: {
            front: `The message you are replying to is valid.`,
            back: `'replyingTo' field (MongoDB ObjectId) is valid`,
        },
    };
};
