const calculateChatStatusesAndParticipantsNames = async (chatsList) => {
    let statusHeirarchy = {
        online: 3,
        away: 2,
        busy: 1,
        offline: 0,
    };
    let status = "offline";
    for (let i = 0; i < chatsList.length; i++) {
        for (let j = 0; j < chatsList[i].participants.length; j++) {
            const user = chatsList[i].participants[j];
            if (user.status > statusHeirarchy[status]) status = user.status;
            chatsList[i].participants[j] = user.displayName
                ? user.displayName
                : user.username;
        }
    }
};

const getChatsList = async (abortController) => {
    const data = {
        chats: [
            {
                _id: "1",
                name: "",
                participants: [
                    {
                        username: "Elizabeth",
                        displayName: "eliza",
                        status: "online",
                    },
                    {
                        username: "William",
                        displayName: "will",
                        status: "away",
                    },
                    {
                        username: "Jennifer",
                        displayName: "jen",
                        status: "offline",
                    },
                ],
                recentMessage: {
                    author: "Elizabeth",
                    message: "Hello guys! Nice to finally speak to you all.",
                },
                imageSrc: "",
                imageAlt: "",
            },
        ],
    };

    await calculateChatStatusesAndParticipantsNames(data.chats);

    return {
        status: 200,
        message: "Chats found.",
        chats: data.chats,
    };
};

export default getChatsList;
