import saveTokenFromResponseJSON from "./saveTokenFromResponseJSON.js";

export const displayName = async (value, abortController) => {
    const data = await fetch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/user/preferences/displayName`,
        {
            signal: abortController ? abortController.signal : null,
            method: "PUT",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                authorization: localStorage.getItem(
                    "odin-messaging-app-auth-token"
                ),
            },
            body: JSON.stringify({
                displayName: value,
            }),
        }
    )
        .then(async (response) => {
            const responseJSON = await response.json();
            saveTokenFromResponseJSON(responseJSON);

            if (responseJSON.status === 401) {
                window.location.href = "/log-in";
            }

            return {
                status: responseJSON.status,
                message: responseJSON.message,
            };
        })
        .catch((error) => {
            return {
                status: 500,
                message: "Updating display name failed.",
            };
        });
    return data;
};

export const tagLine = async (value, abortController) => {
    const data = await fetch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/user/preferences/tagLine`,
        {
            signal: abortController ? abortController.signal : null,
            method: "PUT",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                authorization: localStorage.getItem(
                    "odin-messaging-app-auth-token"
                ),
            },
            body: JSON.stringify({
                tagLine: value,
            }),
        }
    )
        .then(async (response) => {
            const responseJSON = await response.json();
            saveTokenFromResponseJSON(responseJSON);

            if (responseJSON.status === 401) {
                window.location.href = "/log-in";
            }

            return {
                status: responseJSON.status,
                message: responseJSON.message,
            };
        })
        .catch((error) => {
            return {
                status: 500,
                message: "Updating tag line failed.",
            };
        });
    return data;
};

export const status = async (value, abortController) => {
    const data = await fetch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/user/preferences/setStatus`,
        {
            signal: abortController ? abortController.signal : null,
            method: "PUT",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                authorization: localStorage.getItem(
                    "odin-messaging-app-auth-token"
                ),
            },
            body: JSON.stringify({
                setStatus: value,
            }),
        }
    )
        .then(async (response) => {
            const responseJSON = await response.json();
            saveTokenFromResponseJSON(responseJSON);

            if (responseJSON.status === 401) {
                window.location.href = "/log-in";
            }

            return {
                status: responseJSON.status,
                message: responseJSON.message,
            };
        })
        .catch((error) => {
            return {
                status: 500,
                message: "Updating tag line failed.",
            };
        });
    return data;
};

export const profileImage = (value, abortController) => {
    return {
        status: 200,
        message: "Done.",
    };
};
