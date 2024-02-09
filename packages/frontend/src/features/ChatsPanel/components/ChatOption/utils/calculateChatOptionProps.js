import combineParticipantNames from "../../../utils/combineParticipantNames.js";

const statusHeirarchy = {
    online: 3,
    away: 2,
    busy: 1,
    offline: 0,
};

const calculateChatOptionProps = (chat, userId) => {
    const chatProps = {
        name: "",
        recentMessage: null,
        status: "offline",
        imageSrc: "",
        imageAlt: "",
    };

    const message = chat.messages.length > 0 ? chat.messages[0] : null;
    const participantNames = [];

    for (let j = 0; j < chat.participants.length; j++) {
        const participant = chat.participants[j];
        const user = participant.user;

        if (user.status > statusHeirarchy[chatProps.status]) {
            chatProps.status = user.status;
        }

        let name = "";
        if (participant.nickname.length > 0) {
            name = participant.nickname;
        } else if (user.preferences.displayName.length > 0) {
            name = user.preferences.displayName;
        } else {
            name = user.username;
        }
        if (userId && user._id.toString() === userId.toString()) {
        } else {
            participantNames.push(name);
        }

        if (message && message.author.toString() === user._id.toString()) {
            chatProps.recentMessage = {
                author: name,
                message: message.text,
            };
        }
    }

    if (chatProps.name.length !== 0) {
        chatProps.name = chat.name;
    } else {
        chatProps.name = combineParticipantNames(participantNames, 3);
    }

    return chatProps;
};

export default calculateChatOptionProps;
