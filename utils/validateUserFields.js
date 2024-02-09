import * as themes from "../packages/frontend/src/themes/index.js";

export const username = (value) => {
    const pattern = /^[a-zA-Z0-9]*$/;
    if (value.length === 0) {
        return {
            status: false,
            message: {
                front: "Username must not be empty.",
                back: "'username' field (String) be at least 5 characters in length",
            },
        };
    }
    if (!value.match(pattern)) {
        return {
            status: false,
            message: {
                front: "Username must only contain alphanumeric characters.",
                back: "'username' field (String) must only contain alphanumeric characters",
            },
        };
    }
    if (value.length < 5) {
        return {
            status: false,
            message: {
                front: "Username must be at least 5 characters in length.",
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

export const email = (value) => {
    const pattern =
        /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    if (value.length === 0) {
        return {
            status: false,
            message: {
                front: "Email must not be empty.",
                back: "'email' field (String) must not be empty",
            },
        };
    }
    if (!value.match(pattern)) {
        return {
            status: false,
            message: {
                front: "Email must be in the format: 'name@company.com'.",
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

export const password = (value, confirming = false) => {
    const pattern =
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (value.length === 0) {
        return {
            status: false,
            message: {
                front: `${
                    confirming ? "Confirm " : ""
                }Password must not be empty.`,
                back: `'${
                    confirming ? "confirmP" : "p"
                }assword' field (String) must not be empty`,
            },
        };
    }
    if (!value.match(pattern)) {
        return {
            status: false,
            message: {
                front: `${confirming ? "Confirm " : ""}Password must
                contain at least 8 characters, including at least one letter
                from a-z, at least one number from 0-9, and at least one of the
                following symbols: @$!%*#?&`,
                back: `'${confirming ? "confirmP" : "p"}assword' field (String)
                must contain at least 8 characters, including at least one
                letter from a-z, at least one number from 0-9, and at least one
                of the following symbols: @$!%*#?&`,
            },
        };
    }
    return {
        status: true,
        message: {
            front: `Valid ${confirming ? "Confirm " : ""}Password.`,
            back: `'${
                confirming ? "confirmP" : "p"
            }assword' field (String) is valid`,
        },
    };
};

export const displayName = (value) => {
    const pattern = /^[a-zA-Z0-9]*$/;
    if (!value.match(pattern)) {
        return {
            status: false,
            message: {
                front: "Display Name must only contain alphanumeric characters.",
                back: "'displayName' field (String) must only contain alphanumeric characters",
            },
        };
    }
    if (value.length > 30) {
        return {
            status: false,
            message: {
                front: "Display Name must be fewer than 30 characters in length.",
                back: "'displayName' field (String) must be fewer than 30 characters in length",
            },
        };
    }
    return {
        status: true,
        message: {
            front: "Valid Display Name.",
            back: "'displayName' field (String) is valid",
        },
    };
};

export const tagLine = (value) => {
    if (value.length > 100) {
        return {
            status: false,
            message: {
                front: "Tag Line must be fewer than 100 characters in length.",
                back: "'tagLine' field (String) must be fewer than 100 characters in length",
            },
        };
    }
    return {
        status: true,
        message: {
            front: "Valid Tag Line.",
            back: "'tagLine' field (String) is valid",
        },
    };
};

export const status = (value) => {
    if (
        value !== "online" &&
        value !== "away" &&
        value !== "busy" &&
        value !== "offline" &&
        value !== null
    ) {
        return {
            status: false,
            message: {
                front: "Status must be one of the following: 'default', 'online', 'away', 'busy', 'offline'.",
                back: "'status' field (String) must be one of the following: null (default), 'online', 'away', 'busy', 'offline'.",
            },
        };
    }
    return {
        status: true,
        message: {
            front: "Valid Status.",
            back: "'status' field (Enum) is valid",
        },
    };
};

export const profileImage = (value) => {
    if (!Array.isArray(value)) {
        return {
            status: false,
            message: {
                front: `Profile Image must be an Array.`,
                back: `'profileImage' field must be an Array.`,
            },
        };
    }
    if (value.length > 5000000) {
        return {
            status: false,
            message: {
                front: `Profile Image must be smaller than 5MB.`,
                back: `'profileImage' field (Array) must be smaller than 5MB.`,
            },
        };
    }
    return {
        status: true,
        message: {
            front: `Valid Profile Image.`,
            back: `'profileImage' field (Array) is valid`,
        },
    };
};

export const theme = (value) => {
    if (!themes.optionNames().includes(value)) {
        return {
            status: false,
            message: {
                front: `Theme must be one of the following: ${themes}.`,
                back: `'theme' field (String) must be one of the following: ${themes}.`,
            },
        };
    }
    return {
        status: true,
        message: {
            front: `Valid Theme.`,
            back: `theme field (Image) is valid`,
        },
    };
};
