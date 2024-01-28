import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.css";

import ProfileImage from "@/components/ProfileImage";
import OptionButton from "@/components/OptionButton";
import FieldUpdater from "@/components/FieldUpdater";
import FriendSelectorPanel from "../FriendSelectorPanel";
import Message from "./components/Message"
import MessageBox from "./components/MessageBox";

import getChat from "./utils/getChat";
import combineParticipantNames from "../../utils/combineParticipantNames";
import addFriendsToChat from "./utils/addFriendsToChat";
import updateChatImage from "./utils/updateChatImage";
import * as sendMessage from "./utils/sendMessage.js";
import * as extractImage from "@/utils/extractImage";
import * as validateChat from "../../../../../../../utils/validateChatFields.js";
import * as validateMessage from "../../../../../../../utils/validateMessageFields.js";

import mongoose from "mongoose";

const ChatPanel = ({
    chatId,
    userId,
    messageSentHandler,
    addedFriendsHandler,
    updatedChatImageHandler,
}) => {
    const [panel, setPanel] = useState("chat");
    const [midSectionContent, setMidSectionContent] = useState(null);

    const [chat, setChat] = useState({
        currentValue: null,
        abortController: null,
        attempting: false,
        appending: false,
    });

    const [participantInfo, setParticipantInfo] = useState(new Map());

    const [addingFriendsToChat, setAddingFriendsToChat] = useState({
        userIds: [],
        abortController: null,
        attempting: false,
        submissionErrors: [],
    });

    const [sendingMessage, setSendingMessage] = useState({
        currentType: "text",
        currentText: "",
        currentImage: null,
        replyingTo: null,
        abortController: null,
        attempting: false,
        submissionErrors: [],
    });

    const checkIfWaiting = () => {
        return (
            chat.attempting ||
            chat.appending ||
            addingFriendsToChat.attempting ||
            sendingMessage.attempting
        );
    }

    const switchPanel = (desiredPanel) => {
        if (!checkIfWaiting()) {
            if (panel === desiredPanel) {
                setPanel("chat");
            } else {
                setPanel(desiredPanel);
            }
        }
    }

    useEffect(() => {
        if (chat.abortController) chat.abortController.abort;
        const abortControllerNew = new AbortController();
        if (chat.attempting || chat.appending) {
            setChat({
                ...chat,
                abortController: abortControllerNew,
            });
            (async () => {
                const messageQuantity = chat.currentValue ? chat.currentValue.messages.length : 0;
                const existingMessages = chat.currentValue ? chat.currentValue.messages : [];
                const response = await getChat(chatId, [
                    messageQuantity,
                    messageQuantity + 20
                ], abortControllerNew);
                setChat({
                    ...chat,
                    currentValue: {
                        ...response.chat,
                        messages: [...existingMessages, ...response.chat.messages],
                    },
                    abortController: null,
                    attempting: false,
                    appending: false,
                });
            })();
        }

        return () => {
            if (chat.abortController) chat.abortController.abort;
        }
    }, [chat.attempting, chat.appending]);

    useEffect(() => {
        if (mongoose.Types.ObjectId.isValid(chatId)) {
            setPanel("chat");
            setChat({
                ...chat,
                attempting: true,
            })
        } else {
            setChat({
                ...chat,
                currentValue: null,
            });
        }
    }, [chatId]);
    
    const attemptSendMessage = (info) => {
        // Client-side validation
        let validCredentials = true;
        const messageSubmissionErrorsNew = [];

        if (sendingMessage.replyingTo) {
            const validReplyingTo = validateMessage.replyingTo(sendingMessage.replyingTo._id);
            if (!validReplyingTo.status) {
                validCredentials = false;
                messageSubmissionErrorsNew.push(validReplyingTo.message.front);
            }
        }

        switch (info.type) {
            case "text":
                const validText = validateMessage.text(info.value);
                if (!validText.status) {
                    validCredentials = false;
                    messageSubmissionErrorsNew.push(validText.message.front);
                }
                break;
            case "image":
                const validImage = validateMessage.image(info.value);
                if (!validImage.status) {
                    validCredentials = false;
                    messageSubmissionErrorsNew.push(validImage.message.front);
                }
                break;
        }

        if (!validCredentials) {
            setSendingMessage({
                ...sendingMessage,
                submissionErrors: messageSubmissionErrorsNew,
            });
            return;
        }
        setSendingMessage({
            ...sendingMessage,
            currentType: info.type,
            currentText: info.type === "text" ? info.value : sendingMessage.currentText,
            currentImage: info.type === "image" ? info.value : sendingMessage.currentImage,
            attempting: true,
        });
    };
    
    const attemptAddingFriendsToChat = (userIds) => {
        // Client-side validation
        const invalidUserIds = [];
        for (let i = 0; i < userIds.length; i++) {
            if (!mongoose.Types.ObjectId.isValid(userIds[i])) {
                invalidUserIds.push(userIds[i]);
            }
        }
        if (invalidUserIds.length > 0) {
            setAddingFriendsToChat({
                ...addingFriendsToChat,
                submissionErrors: `Not all of the provided user ids to add to
                the chat are valid: ${invalidUserIds}`
            });
            return;
        }

        setAddingFriendsToChat({
            ...addingFriendsToChat,
            attempting: true,
            userIds: userIds,
        });
    };

    useEffect(() => {
        if (sendingMessage.abortController) sendingMessage.abortController.abort;
        const abortControllerNew = new AbortController();
        if (sendingMessage.attempting) {
            setSendingMessage({
                ...sendingMessage,
                abortController: abortControllerNew,
            });
            (async () => {
                let response;
                switch (sendingMessage.currentType) {
                    case "text":
                        response = await sendMessage.text(chatId, {
                            text: sendingMessage.currentText,
                            replyingTo: sendingMessage.replyingTo
                                ? sendingMessage.replyingTo._id
                                : null,
                        }, abortControllerNew);
                        break;
                    case "image":
                        response = await sendMessage.image(chatId, {
                            image: sendingMessage.currentImage,
                            replyingTo: sendingMessage.replyingTo
                                ? sendingMessage.replyingTo._id
                                : null,
                        }, abortControllerNew);
                        break;
                    default:
                        response = {
                            status: 400,
                            message: "Invalid message type (expecting 'text' or 'image')",
                        }
                }
                if (response.status >= 400) {
                    setSendingMessage({
                        ...sendingMessage,
                        currentImage: null,
                        attempting: false,
                        abortController: null,
                        submissionErrors: [response.message],
                    });
                } else {
                    const messages = [...chat.currentValue.messages];
                    messages.unshift(response.newMessage);
                    setChat({
                        ...chat,
                        currentValue: {
                            ...chat.currentValue,
                            messages: messages,
                        }
                    });
                    setSendingMessage({
                        ...sendingMessage,
                        currentText: sendingMessage.currentType === "text" ? "" : sendingMessage.currentText,
                        currentImage: null,
                        replyingTo: null,
                        attempting: false,
                        abortController: null,
                        submissionErrors: [],
                    });
                    messageSentHandler(response.newMessage);
                }
            })();
        } else {
            setSendingMessage({
                ...sendingMessage,
                abortController: null,
            });
        }

        return () => {
            if (sendingMessage.abortController) sendingMessage.abortController.abort;
        }
    }, [sendingMessage.attempting]);

    useEffect(() => {
        if (addingFriendsToChat.abortController) addingFriendsToChat.abortController.abort;
        const abortControllerNew = new AbortController();
        if (addingFriendsToChat.attempting) {
            setAddingFriendsToChat({
                ...addingFriendsToChat,
                abortController: abortControllerNew,
            });
            (async () => {
                const response = await addFriendsToChat(
                    chatId,
                    Array.from(addingFriendsToChat.userIds),
                    abortControllerNew
                );
                if (response.status >= 400) {
                    setAddingFriendsToChat({
                        ...addingFriendsToChat,
                        attempting: false,
                        abortController: null,
                        submissionErrors: [response.message]
                    });
                } else {
                    setAddingFriendsToChat({
                        ...addingFriendsToChat,
                        panelOpen: false,
                        attempting: false,
                        abortController: null,
                        submissionErrors: []
                    });
                    setChat({
                        ...chat,
                        attempting: true,
                    });
                    addedFriendsHandler(response.chatId);
                }
            })();
        } else {
            setAddingFriendsToChat({
                ...addingFriendsToChat,
                abortController: null,
            });
        }

        return () => {
            if (addingFriendsToChat.abortController) addingFriendsToChat.abortController.abort;
        }
    }, [addingFriendsToChat.attempting]);

    useEffect(() => {
        if (chat.currentValue && typeof chat.currentValue === "object" && "participants" in chat.currentValue) {
            const participantInfoNew = new Map();
            chat.currentValue.participants.forEach((participant) => {
                let participantName = "User";
                if (participant.nickname.length > 0) {
                    participantName = participant.nickname;
                } else if (participant.user.preferences.displayName.length > 0) {
                    participantName = participant.user.preferences.displayName;
                } else {
                    participantName = participant.user.username;
                }

                participantInfoNew.set(participant.user._id, {
                    _id: participant.user._id,
                    name: participantName,
                    profileImage: extractImage.fromUser(participant.user).image,
                });
            });
            setParticipantInfo(participantInfoNew);
        }
    }, [chat.currentValue]);

    const chatImage = extractImage.fromChat(chat.currentValue).image;

    useEffect(() => {
        switch (panel) {
            case "chat":
                if (!chat.currentValue) {
                    setMidSectionContent(null);
                    break;
                }
                setMidSectionContent((
                    <div className={styles["messages-container"]}>
                        <ul
                            className={styles["message-list"]}
                            aria-label="chat-message-list"
                        >
                            {chat.currentValue.messages && Array.isArray(chat.currentValue.messages) && chat.currentValue.messages.length > 0
                            ?   <>
                                {chat.currentValue.messages.map((message, i) => {
                                    return (
                                        <li
                                            aria-label="chat-message"
                                            key={message._id}
                                        ><Message
                                            text={message.text}
                                            image={
                                                typeof message.image !== "undefined"
                                                    ? extractImage.fromMessage(message).image
                                                    : null
                                            }
                                            name={
                                                participantInfo.get(message.author) ?
                                                participantInfo.get(message.author).name :
                                                "user"
                                            }
                                            dateSent={message.createdAt}
                                            profileImage={
                                                participantInfo.get(message.author) ?
                                                participantInfo.get(message.author).profileImage :
                                                { ...ProfileImage.defaultProps }
                                            }
                                            position={
                                                userId &&
                                                message.author.toString() === userId.toString() ?
                                                    "right" :
                                                    "left"
                                            }
                                            replyingTo={message.replyingTo ?
                                            {
                                                author:
                                                    participantInfo.get(message.replyingTo.author._id) ?
                                                    participantInfo.get(message.replyingTo.author._id).name :
                                                    "User",
                                                text: message.replyingTo.text,
                                                image: typeof message.replyingTo.image !== "undefined"
                                                    ? extractImage.fromMessage(message.replyingTo).image
                                                    : null,
                                            }
                                            : null}
                                            onReplyToHandler={(e) => {
                                                if (!sendMessage.attempting) {
                                                    if (sendingMessage.replyingTo && sendingMessage.replyingTo._id.toString() === message._id.toString()) {
                                                        setSendingMessage({
                                                            ...sendingMessage,
                                                            replyingTo: null,
                                                        });
                                                    } else {
                                                        setSendingMessage({
                                                            ...sendingMessage,
                                                            replyingTo: {
                                                                _id: message._id,
                                                                authorId: message.author,
                                                                authorName:
                                                                    participantInfo.get(message.author) ?
                                                                    participantInfo.get(message.author).name :
                                                                    "user",
                                                                text: message.text
                                                            },
                                                        });
                                                    }
                                                }
                                            }}
                                        /></li>
                                    )
                                })}
                                <button
                                    className={styles["load-more-button"]}
                                    aria-label="load-more"
                                    onClick={(e) => {
                                        if (!checkIfWaiting()) {
                                            setChat({
                                                ...chat,
                                                appending: true,
                                            });
                                        }
                                        e.currentTarget.blur();
                                        e.preventDefault();
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.blur();
                                    }}
                                >{!chat.appending
                                ?   "Load More"
                                :   <div className={styles["load-more-button-waiting-wheel-container"]}>
                                        <div
                                            className={styles["load-more-button-waiting-wheel"]}
                                            aria-label="waiting"
                                        ></div>
                                    </div>
                                }</button>
                                </>
                            :   <p
                                    className={styles["empty-chat-text"]}
                                    aria-label="empty-chat-text"
                                >There are no messages in this chat yet!</p>
                            }
                        </ul>
                    </div>
                ));
                break;
            case "addingFriends":
                setMidSectionContent((
                    <FriendSelectorPanel
                        title="Add Friends to Chat"
                        removeButtonText="Remove"
                        addButtonText="Add"
                        submitButtonText="Add Friends"
                        noFriendsText="You have no friends you can add to this chat"
                        onCloseHandler={() => switchPanel("chat")}
                        onSubmitHandler={(participants) => {
                            if (!checkIfWaiting()) {
                                attemptAddingFriendsToChat(participants);
                            }
                        }}
                        submissionErrors={addingFriendsToChat.submissionErrors}
                    />
                ));
                break;
            case "updatingChatImage":
                setMidSectionContent((
                    <div
                        className={styles["update-chat-image-container"]}
                        key="update-chat-image-container"
                    >
                        <FieldUpdater
                            labelText="Set a New Chat Image"
                            fieldName="image"
                            initialValue={extractImage.fromChat(chat.currentValue).image.src}
                            validator={validateChat.image}
                            apiFunction={{
                                func: updateChatImage,
                                args: [chatId],
                            }}
                            context={{ type: "image" }}
                            onUpdateHandler={() => {
                                switchPanel("chat");
                                if (!checkIfWaiting()) {
                                    setChat({
                                        ...chat,
                                        attempting: true,
                                    });
                                }
                                updatedChatImageHandler();
                            }}
                        />
                    </div>
                ));
                break;
        };
    }, [panel, chat]);

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            {!chat.attempting
            ?   <>
                {chat.currentValue !== null
                ?   <>
                    <div className={styles["top-bar"]}>
                        <button
                            className={styles["chat-image"]}
                            aria-label="chat-image"
                            onClick={(e) => {
                                switchPanel("updatingChatImage")
                                e.currentTarget.blur();
                                e.preventDefault();
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.blur();
                            }}
                        >
                            <ProfileImage
                                src={chatImage.src}
                                alt={chatImage.alt}
                                status={null}
                                sizePx={50}
                            />
                        </button>
                        {chat.currentValue.name.length > 0
                        ?   <h3
                                className={styles["chat-name-custom"]}
                                aria-label="chat-name"
                            >{chat.currentValue.name}</h3>
                        :   <>
                            {chat.currentValue.participants.length > 0
                            ?   <h3
                                    className={styles["chat-name-participants"]}
                                    aria-label="chat-participants"
                                >{combineParticipantNames((() => {
                                    const participants = Array.from(participantInfo.values());
                                    const participantNames = [];
                                    participants.forEach((participant) => {
                                        if (userId && participant._id.toString() === userId.toString()) return;
                                        participantNames.push(participant.name);
                                    });
                                    return participantNames;
                                })(), 3)}</h3>
                            :   <h3
                                    className={styles["chat-name"]}
                                    aria-label="chat-name"
                                >Chat</h3>
                            }
                            </>
                        }
                        <ul
                            className={styles["chat-options"]}
                            aria-label="chat-options"
                        >
                            <OptionButton
                                text="person_add"
                                tooltipText="Add Person"
                                tooltipPosition="bottom"
                                widthPx={44}
                                heightPx={44}
                                fontSizePx={22}
                                borderStyle="circular"
                                onClickHandler={() => switchPanel("addingFriends")}
                            />
                            <OptionButton
                                text="call"
                                tooltipText="Call"
                                tooltipPosition="bottom"
                                widthPx={44}
                                heightPx={44}
                                fontSizePx={22}
                                borderStyle="circular"
                                onClickHandler={() => {}}
                            />
                            <OptionButton
                                text="videocam"
                                tooltipText="Video Call"
                                tooltipPosition="bottom"
                                widthPx={44}
                                heightPx={44}
                                fontSizePx={22}
                                borderStyle="circular"
                                onClickHandler={() => {}}
                            />
                        </ul>
                    </div>
                    {midSectionContent}
                    {sendingMessage.replyingTo
                    ?   <div className={styles["replying-to-container"]}>
                            {`Replying to ${sendingMessage.replyingTo.authorName}...`}
                        </div>
                    :   null}
                    <div
                        className={styles["text-editor-container"]}
                    >
                        <MessageBox
                            text={sendingMessage.currentText}
                            submissionErrors={sendingMessage.submissionErrors}
                            onSubmitHandler={(info) => {
                                if (!checkIfWaiting()) {
                                    attemptSendMessage(info);
                                }
                            }}
                            sending={sendingMessage.attempting}
                        />
                    </div>
                    </>
                :   <div className={styles["no-chat-message-container"]}>
                        <p
                            className={styles["no-chat-message"]}
                            aria-label="no-chat-here"
                        >Create or open a chat to get chatting!</p>
                    </div>
                }
                </>
            :   <div className={styles["waiting-wheel-container"]}>
                    <div
                        className={styles["waiting-wheel"]}
                        aria-label="attempting-create-account"
                    ></div>
                </div>
            }
        </div>
        </div>
    );
};

ChatPanel.propTypes = {
    chatId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    messageSentHandler: PropTypes.func,
    updateChatListHandler: PropTypes.func,
    switchChatHandler: PropTypes.func,
}

ChatPanel.defaultProps = {
    chatId: null,
    userId: null,
    messageSentHandler: () => {},
    updateChatListHandler: () => {},
    switchChatHandler: () => {},
}

export default ChatPanel;