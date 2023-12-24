const usernamePattern = /^[a-zA-Z0-9]*$/;
const passwordPattern =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

export const validateUsername = (username) => {
    if (username.length === 0) {
        return {
            status: false,
            message: "Your Username must not be empty.",
        };
    }
    if (!username.match(usernamePattern)) {
        return {
            status: false,
            message: "Your Username must only contain alphanumeric characters.",
        };
    }
    if (username.length < 5) {
        return {
            status: false,
            message: "Your Username must be at least 5 characters in length.",
        };
    }
    return {
        status: true,
        message: "Valid Username.",
    };
};

export const validatePassword = (password) => {
    if (password.length === 0) {
        return {
            status: false,
            message: "Your Password must not be empty.",
        };
    }
    if (!password.match(passwordPattern)) {
        return {
            status: false,
            message: `Your Password must contain at least 8 characters,
            including at least one letter from a-z, at least one number from
            0-9, and at least one of the following symbols: @$!%*#?&`,
        };
    }
    return {
        status: true,
        message: "Valid Password.",
    };
};
