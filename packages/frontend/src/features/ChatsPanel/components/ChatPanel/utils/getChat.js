import saveTokenFromResponseJSON from "@/utils/saveTokenFromResponseJSON";
import redirectUserToLogin from "@/utils/redirectUserToLogin.js";

const getChat = async (
    chatId,
    [firstMessage, lastMessage],
    abortController
) => {
    const data = await fetch(
        `${
            import.meta.env.VITE_SERVER_DOMAIN
        }/chat/${chatId}?firstMessage=${firstMessage}&lastMessage=${lastMessage}`,
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

            if (responseJSON.status === 401) redirectUserToLogin();

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
                status: error.status ? error.status : 500,
                message: error.message,
                chat: null,
            };
        });
    return data;
};

export default getChat;
