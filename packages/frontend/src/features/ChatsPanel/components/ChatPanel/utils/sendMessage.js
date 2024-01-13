import saveTokenFromResponseJSON from "@/utils/saveTokenFromResponseJSON";

const sendMessage = async (chatId, message, abortController) => {
    const data = await fetch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/chat/${chatId}/message`,
        {
            signal: abortController ? abortController.signal : null,
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                authorization: localStorage.getItem(
                    "odin-messaging-app-auth-token"
                ),
                body: JSON.stringify(message),
            },
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
                message: "Sending message failed",
                chat: null,
            };
        });
    return data;
};

export default sendMessage;
