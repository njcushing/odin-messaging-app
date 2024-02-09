import saveTokenFromResponseJSON from "@/utils/saveTokenFromResponseJSON.js";

const createChat = async (participants, abortController) => {
    const data = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/chat`, {
        signal: abortController ? abortController.signal : null,
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "application/json",
            authorization: localStorage.getItem(
                "odin-messaging-app-auth-token"
            ),
        },
        body: JSON.stringify(participants),
    })
        .then(async (response) => {
            const responseJSON = await response.json();
            saveTokenFromResponseJSON(responseJSON);

            if (responseJSON.status === 401) {
                window.location.href = "/log-in";
            }

            let chatId = null;
            if (
                responseJSON.data !== null &&
                typeof responseJSON.data === "object" &&
                "chatId" in responseJSON.data
            ) {
                chatId = responseJSON.data.chatId;
            }

            return {
                status: responseJSON.status,
                message: responseJSON.message,
                chatId: chatId,
            };
        })
        .catch((error) => {
            return {
                status: 500,
                message: "Accepting friend request failed",
                chatId: null,
            };
        });
    return data;
};

export default createChat;
