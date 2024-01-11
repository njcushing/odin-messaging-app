import saveTokenFromResponseJSON from "@/utils/saveTokenFromResponseJSON";

const getChat = async (chatId, abortController) => {
    const data = await fetch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/chat/${chatId}`,
        {
            signal: abortController ? abortController.signal : null,
            method: "GET",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                authorization: localStorage.getItem(
                    "odin-messaging-app-auth-token"
                ),
            },
        }
    )
        .then(async (response) => {
            const responseJSON = await response.json();
            saveTokenFromResponseJSON(responseJSON);

            if (responseJSON.status === 401) {
                window.location.href = "/log-in";
            }

            let chat = null;
            if (
                responseJSON.data !== null &&
                typeof responseJSON.data === "object" &&
                "chat" in responseJSON.data
            ) {
                chat = responseJSON.data.chat;
            }

            return {
                status: responseJSON.status,
                message: responseJSON.message,
                chat: chat,
            };
        })
        .catch((error) => {
            return {
                status: 500,
                message: "Accepting friend request failed",
                chat: null,
            };
        });
    return data;
};

export default getChat;
