import saveTokenFromResponseJSON from "@/utils/saveTokenFromResponseJSON.js";

const addFriendsToChat = async (chatId, participants, abortController) => {
    const data = await fetch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/chat/${chatId}/add-friends`,
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
            body: JSON.stringify({
                participants: participants,
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
                message: "Adding friends to chat failed",
            };
        });
    return data;
};

export default addFriendsToChat;
