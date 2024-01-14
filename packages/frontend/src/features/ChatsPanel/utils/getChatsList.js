import saveTokenFromResponseJSON from "@/utils/saveTokenFromResponseJSON.js";

const calculateChatStatusesAndParticipantsNames = async (chatsList) => {
    let statusHeirarchy = {
        online: 3,
        away: 2,
        busy: 1,
        offline: 0,
    };
    let status = "offline";
    for (let i = 0; i < chatsList.length; i++) {
        const message =
            chatsList[i].messages.length > 0 ? chatsList[i].messages[0] : null;
        for (let j = 0; j < chatsList[i].participants.length; j++) {
            const participant = chatsList[i].participants[j];
            const user = participant.user;
            if (user.status > statusHeirarchy[status]) status = user.status;
            if (participant.nickname.length > 0) {
                chatsList[i].participants[j] = participant.nickname;
            } else if (user.preferences.displayName > 0) {
                chatsList[i].participants[j] = user.preferences.displayName;
            } else {
                chatsList[i].participants[j] = user.username;
            }
            if (message && message.author.toString() === user._id.toString()) {
                message.author = chatsList[i].participants[j];
            }
        }
    }
};

const getChatsList = async (abortController) => {
    const data = await fetch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/user/chats`,
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

            let chats = null;
            if (
                responseJSON.data !== null &&
                typeof responseJSON.data === "object" &&
                "chats" in responseJSON.data
            ) {
                chats = responseJSON.data.chats;
            }

            await calculateChatStatusesAndParticipantsNames(
                responseJSON.data.chats
            );

            return {
                status: responseJSON.status,
                message: responseJSON.message,
                chats: responseJSON.data.chats,
            };
        })
        .catch((error) => {
            return {
                status: 500,
                message: "Accepting friend request failed",
                chats: [],
            };
        });
    return data;
};

export default getChatsList;
