export const validateUsername = (username) => {
    if (username.length === 0) {
        return {
            status: false,
            message: "Please fill in your Username.",
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
            message: "Please fill in your Password.",
        };
    }
    return {
        status: true,
        message: "Valid Password.",
    };
};
