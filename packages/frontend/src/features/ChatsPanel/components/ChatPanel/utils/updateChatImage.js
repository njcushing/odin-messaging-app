import saveTokenFromResponseJSON from "@/utils/saveTokenFromResponseJSON.js";

const updateChatImage = async (value, abortController, args) => {
    const [chatId] = args;

    const data = await fetch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/chat/${chatId}/image`,
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
                image: value,
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
                message: "Updating chat image failed.",
            };
        });
    return data;
};

export default updateChatImage;
