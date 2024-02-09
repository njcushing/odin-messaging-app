const usernamePattern = /^[a-zA-Z0-9]*$/;
const emailPattern =
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
const passwordPattern =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

export const validateUsername = (username) => {
    if (username.length === 0) {
        return {
            status: false,
            message: {
                front: "Your Username must not be empty.",
                back: "'username' field (String) be at least 5 characters in length",
            },
        };
    }
    if (!username.match(usernamePattern)) {
        return {
            status: false,
            message: {
                front: "Your Username must only contain alphanumeric characters.",
                back: "'username' field (String) must only contain alphanumeric characters",
            },
        };
    }
    if (username.length < 5) {
        return {
            status: false,
            message: {
                front: "Your Username must be at least 5 characters in length.",
                back: "'username' field (String) must be at least 5 characters in length",
            },
        };
    }
    return {
        status: true,
        message: {
            front: "Valid Username.",
            back: "'username' field (String) is valid",
        },
    };
};

export const validateEmail = (email) => {
    if (email.length === 0) {
        return {
            status: false,
            message: {
                front: "Your Email must not be empty.",
                back: "'email' field (String) must not be empty",
            },
        };
    }
    if (!email.match(emailPattern)) {
        return {
            status: false,
            message: {
                front: "Your Email must be in the format: 'name@company.com'.",
                back: "'email' field (String) be in the format: 'name@company.com'",
            },
        };
    }
    return {
        status: true,
        message: {
            front: "Valid Email.",
            back: "'email' field (String) is valid",
        },
    };
};

export const validatePassword = (password) => {
    if (password.length === 0) {
        return {
            status: false,
            message: {
                front: "Your Password must not be empty.",
                back: "'password' field (String) must not be empty",
            },
        };
    }
    if (!password.match(passwordPattern)) {
        return {
            status: false,
            message: {
                front: `Your Password must contain at least 8 characters,
                including at least one letter from a-z, at least one number from
                0-9, and at least one of the following symbols: @$!%*#?&`,
                back: `'password' field (String) must contain at least 8
                characters, including at least one letter from a-z, at least one
                number from 0-9, and at least one of the following symbols:
                @$!%*#?&`,
            },
        };
    }
    return {
        status: true,
        message: {
            front: "Valid Password.",
            back: "'password' field (String) is valid",
        },
    };
};
