import combineParticipantNames from "../../../utils/combineParticipantNames.js";
import * as extractImage from "@/utils/extractImage.js";

export const defaultProps = () => ({
    name: "",
    recentMessage: null,
    status: null,
    image: {
        src: new Uint8Array([]),
        alt: "",
    },
});

const statusHeirarchy = {
    online: 4,
    away: 3,
    busy: 2,
    offline: 1,
    null: 0,
};

export const calculateProps = (chat, userId) => {
    const chatProps = { ...defaultProps() };

    const message = chat.messages.length > 0 ? chat.messages[0] : null;
    const participantNames = [];

    chatProps.image = extractImage.fromChat(chat).image;

    for (let j = 0; j < chat.participants.length; j++) {
        const participant = chat.participants[j];
        const user = participant.user;

        if (statusHeirarchy[user.status] > statusHeirarchy[chatProps.status]) {
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
        if (userId && user._id.toString() !== userId.toString()) {
            participantNames.push(name);
        }

        if (message && message.author.toString() === user._id.toString()) {
            let recentMessageText = "...";
            if (
                typeof message.text !== "undefined" &&
                message.text.length > 0
            ) {
                recentMessageText = message.text;
            } else {
                if (extractImage.fromMessage(message).found) {
                    recentMessageText = "Image";
                }
            }
            chatProps.recentMessage = {
                author: name,
                message: recentMessageText,
            };
        }
    }

    if (chat.name.length !== 0) {
        chatProps.name = chat.name;
    } else {
        chatProps.name = combineParticipantNames(participantNames, 3);
    }

    return chatProps;
};
