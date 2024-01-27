import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.css";

import ProfileImage from "@/components/ProfileImage";
import OptionButton from "@/components/OptionButton";
import FriendSelectorPanel from "../FriendSelectorPanel";
import Message from "./components/Message"
import MessageBox from "./components/MessageBox";

import getChat from "./utils/getChat";
import combineParticipantNames from "../../utils/combineParticipantNames";
import addFriendsToChat from "./utils/addFriendsToChat";
import sendMessage from "./utils/sendMessage";

import mongoose from "mongoose";

const ChatPanel = ({
    chatId,
    userId,
    messageSentHandler,
    addedFriendsHandler,
}) => {
    const [chat, setChat] = useState({
        currentValue: null,
        abortController: null,
        attempting: false,
        appending: false,
    });

    const [participantInfo, setParticipantInfo] = useState(new Map());

    const [addingFriendsToChat, setAddingFriendsToChat] = useState({
        panelOpen: false,
        userIds: [],
        abortController: null,
        attempting: false,
        submissionErrors: [],
    });

    const [sendingMessageAC, setSendingMessageAC] = useState(null);
    const [attemptingSendMessage, setAttemptingSendMessage] = useState(false);
    const [currentMessage, setCurrentMessage] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);
    const [messageSubmissionErrors, setMessageSubmissionErrors] = useState([]);

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
    
    const attemptSendMessage = useCallback(async (form) => {
        const formData = new FormData(form);
        const formFields = Object.fromEntries(formData);

        // Client-side validation
        let validCredentials = true;
        const messageSubmissionErrorsNew = [];
        if (formFields.text.length < 1 || formFields.text.length > 1000) {
            validCredentials = false;
            messageSubmissionErrorsNew.push("Message text must not be empty and cannot exceed 1000 characters in length.");
        }
        if (replyingTo && !mongoose.Types.ObjectId.isValid(replyingTo)) {
            validCredentials = false;
            messageSubmissionErrorsNew.push("Cannot reply to this message as the id of its author is invalid.")
        }

        setMessageSubmissionErrors(messageSubmissionErrorsNew);
        if (!validCredentials) return;

        setAttemptingSendMessage(true);
        setCurrentMessage(formFields.text);
    }, []);
    
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
        if (sendingMessageAC) sendingMessageAC.abort;
        const sendingMessageACNew = new AbortController();
        if (attemptingSendMessage) {
            setSendingMessageAC(sendingMessageACNew);
            (async () => {
                const response = await sendMessage(chatId, {
                    messageText: currentMessage,
                    messageReplyingTo: replyingTo ? replyingTo._id : null,
                }, sendingMessageACNew);
                if (response.status >= 400) {
                    setMessageSubmissionErrors([response.message]);
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
                    setCurrentMessage("");
                    setReplyingTo(null);
                    messageSentHandler(response.newMessage);
                }
                setAttemptingSendMessage(false);
                setSendingMessageAC(null);
            })();
        } else {
            setSendingMessageAC(null);
        }

        return () => {
            if (sendingMessageAC) sendingMessageAC.abort;
        }
    }, [attemptingSendMessage]);

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
                    })
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
            if (sendingMessageAC) sendingMessageAC.abort;
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

                const profileImage = participant.user.preferences.profileImage;
                let participantProfileImage = { ...ProfileImage.defaultProps };
                if (typeof profileImage !== "undefined") {
                    if ("img" in profileImage) {
                        participantProfileImage.src = profileImage.img.data.data;
                    }
                    if ("alt" in profileImage) {
                        participantProfileImage.alt = profileImage.alt;
                    }
                    participantProfileImage.status = participant.user.status;
                }

                participantInfoNew.set(participant.user._id, {
                    _id: participant.user._id,
                    name: participantName,
                    profileImage: participantProfileImage,
                });
            });
            setParticipantInfo(participantInfoNew);
        }
    }, [chat.currentValue]);

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            {!chat.attempting
            ?   <>
                {chat.currentValue !== null
                ?   <>
                    <div className={styles["top-bar"]}>
                        <ProfileImage
                            src={""}
                            alt={""}
                            sizePx={50}
                        />
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
                                onClickHandler={() => {
                                    if (!addingFriendsToChat.attempting) {
                                        setAddingFriendsToChat({
                                            ...addingFriendsToChat,
                                            panelOpen: !addingFriendsToChat.panelOpen,
                                        });
                                    }
                                }}
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
                    {!addingFriendsToChat.panelOpen
                    ?   <div className={styles["messages-container"]}>
                            <ul
                                className={styles["message-list"]}
                                aria-label="chat-message-list"
                            >
                                {chat.currentValue.messages && Array.isArray(chat.currentValue.messages) && chat.currentValue.messages.length > 0
                                ?   <>
                                    {chat.currentValue.messages.map((message) => {
                                        return (
                                            <li
                                                aria-label="chat-message"
                                                key={message._id}
                                            ><Message
                                                text={message.text}
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
                                                }
                                                : null}
                                                onReplyToHandler={(e) => {
                                                    if (replyingTo && replyingTo._id.toString() === message._id.toString()) {
                                                        setReplyingTo(null);
                                                    } else {
                                                        setReplyingTo({
                                                            _id: message._id,
                                                            authorId: message.author,
                                                            authorName:
                                                                participantInfo.get(message.author) ?
                                                                participantInfo.get(message.author).name :
                                                                "user",
                                                            text: message.text
                                                        });
                                                    }
                                                }}
                                            /></li>
                                        )
                                    })}
                                    <button
                                        className={styles["load-more-button"]}
                                        aria-label="load-more"
                                        onClick={(e) => {
                                            if (!chat.appending) {
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
                    :   <FriendSelectorPanel
                            title="Add Friends to Chat"
                            removeButtonText="Remove"
                            addButtonText="Add"
                            submitButtonText="Add Friends"
                            noFriendsText="You have no friends you can add to this chat"
                            onCloseHandler={() => {
                                setAddingFriendsToChat({
                                    ...addingFriendsToChat,
                                    panelOpen: false,
                                });
                            }}
                            onSubmitHandler={(participants) => {
                                if (!addingFriendsToChat.attempting) {
                                    attemptAddingFriendsToChat(participants);
                                }
                            }}
                            submissionErrors={addingFriendsToChat.submissionErrors}
                        />
                    }
                    {replyingTo
                    ?   <div className={styles["replying-to-container"]}>
                            {`Replying to ${replyingTo.author}...`}
                        </div>
                    :   null}
                    <div
                        className={styles["text-editor-container"]}
                    >
                        <MessageBox
                            text={currentMessage}
                            submissionErrors={messageSubmissionErrors}
                            onSubmitHandler={(form) => {
                                if (!attemptingSendMessage) {
                                    attemptSendMessage(form);
                                }
                            }}
                            sending={attemptingSendMessage}
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