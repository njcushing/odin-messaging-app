export const image = (value) => {
    if (!Array.isArray(value)) {
        return {
            status: false,
            message: {
                front: `Your Image must be an Array.`,
                back: `'image' field must be an Array.`,
            },
        };
    }
    if (value.length > 5000000) {
        return {
            status: false,
            message: {
                front: `Your Image must be smaller than 5MB.`,
                back: `'image' field (Array) must be smaller than 5MB.`,
            },
        };
    }
    return {
        status: true,
        message: {
            front: `Valid Image.`,
            back: `'image' field (Array) is valid`,
        },
    };
};
