import saveTokenFromResponseJSON from "@/utils/saveTokenFromResponseJSON";
import redirectUserToLogin from "@/utils/redirectUserToLogin.js";

export const text = async (chatId, message, abortController) => {
    const data = await fetch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/chat/${chatId}/message/text`,
        {
            signal: abortController ? abortController.signal : null,
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                authorization: localStorage.getItem(
                    "odin-messaging-app-auth-token"
                ),
            },
            body: JSON.stringify(message),
        }
    )
        .then(async (response) => {
            const responseJSON = await response.json();
            saveTokenFromResponseJSON(responseJSON);

            if (responseJSON.status === 401) redirectUserToLogin();

            let message = null;
            if (
                responseJSON.data !== null &&
                typeof responseJSON.data === "object" &&
                "message" in responseJSON.data
            ) {
                message = responseJSON.data.message;
            }

            return {
                status: responseJSON.status,
                message: responseJSON.message,
                newMessage: message,
            };
        })
        .catch((error) => {
            return {
                status: error.status ? error.status : 500,
                message: error.message,
                newMessage: null,
            };
        });
    return data;
};

export const image = async (chatId, image, abortController) => {
    const data = await fetch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/chat/${chatId}/message/image`,
        {
            signal: abortController ? abortController.signal : null,
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                authorization: localStorage.getItem(
                    "odin-messaging-app-auth-token"
                ),
            },
            body: JSON.stringify(image),
        }
    )
        .then(async (response) => {
            const responseJSON = await response.json();
            saveTokenFromResponseJSON(responseJSON);

            if (responseJSON.status === 401) redirectUserToLogin();

            let message = null;
            if (
                responseJSON.data !== null &&
                typeof responseJSON.data === "object" &&
                "message" in responseJSON.data
            ) {
                message = responseJSON.data.message;
            }

            return {
                status: responseJSON.status,
                message: responseJSON.message,
                newMessage: message,
            };
        })
        .catch((error) => {
            return {
                status: error.status ? error.status : 500,
                message: error.message,
                newMessage: null,
            };
        });
    return data;
};
