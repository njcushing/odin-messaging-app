import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.css";

import ProfileImage from "@/components/ProfileImage";
import OptionButton from "@/components/OptionButton";
import FriendSelectorPanel from "../FriendSelectorPanel";
import Message from "./components/Message"
import MessageBox from "./components/MessageBox";

import getSelf from "./utils/getSelf";
import getChat from "./utils/getChat";
import combineParticipantNames from "../../utils/combineParticipantNames";
import sendMessage from "./utils/sendMessage";

import mongoose from "mongoose";

const ChatPanel = ({
    chatId,
}) => {
    const [userInfo, setUserInfo] = useState({});
    const [getUserInfoAC, setGetUserInfoAC] = useState(null);
    const [addingFriendsToChat, setAddingFriendsToChat] = useState(false);
    const [chat, setChat] = useState(null);
    const [gettingChat, setGettingChat] = useState(false);
    const [gettingChatAC, setGettingChatAC] = useState(null);
    const [sendingMessageAC, setSendingMessageAC] = useState(null);
    const [attemptingSendMessage, setAttemptingSendMessage] = useState(false);
    const [currentMessage, setCurrentMessage] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);
    const [messageSubmissionErrors, setMessageSubmissionErrors] = useState([]);

    useEffect(() => {
        if (getUserInfoAC) getUserInfoAC.abort;
        const getUserInfoACNew = new AbortController();
        setGetUserInfoAC(getUserInfoACNew);
        (async () => {
            const response = await getSelf(getUserInfoACNew);
            setUserInfo(response.user);
            setGetUserInfoAC(null);
        })();

        return () => {
            if (getUserInfoAC) getUserInfoAC.abort;
        }
    }, []);

    useEffect(() => {
        if (mongoose.Types.ObjectId.isValid(chatId)) {
            setGettingChat(true);
            reloadChat();
        } else {
            setChat(null);
        }

        return () => {
            if (gettingChatAC) gettingChatAC.abort;
        }
    }, [chatId]);

    const reloadChat = () => {
        if (gettingChatAC) gettingChatAC.abort;
        const gettingChatACNew = new AbortController();
        setGettingChatAC(gettingChatACNew);
        (async () => {
            const chatNew = await getChat(chatId, gettingChatACNew);
            setChat(chatNew.chat);
            setGettingChat(false);
        })();
    };
    
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

    useEffect(() => {
        if (sendingMessageAC) sendingMessageAC.abort;
        const sendingMessageACNew = new AbortController();
        if (attemptingSendMessage) {
            setSendingMessageAC(sendingMessageACNew);
            (async () => {
                const response = await sendMessage(chatId, {
                    messageText: currentMessage,
                    messageReplyingTo: replyingTo,
                }, sendingMessageACNew);
                if (response.status >= 400) {
                    setMessageSubmissionErrors([response.message]);
                } else {
                    const messages = [...chat.messages];
                    messages.push(response.newMessage);
                    setChat({
                        ...chat,
                        messages: messages,
                    });
                    setCurrentMessage("");
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

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            {!gettingChat
            ?   <>
                {chat !== null
                ?   <>
                    <div
                        className={styles["top-bar"]}
                    >
                        <ProfileImage
                            src={""}
                            alt={""}
                            sizePx={50}
                        />
                        {chat.name.length > 0
                        ?   <h3
                                className={styles["chat-name-custom"]}
                                aria-label="chat-name"
                            >{chat.name}</h3>
                        :   <>
                            {chat.participants.length > 0
                            ?   <h3
                                    className={styles["chat-name-participants"]}
                                    aria-label="chat-participants"
                                >{combineParticipantNames(chat.participants.map((participant) => {
                                    if (participant.nickname.length > 0) return participant.nickname;
                                    if (participant.user.preferences.displayName.length > 0) return participant.user.preferences.displayName;
                                    return participant.user.username;
                                }), 3)}</h3>
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
                                onClickHandler={() => { setAddingFriendsToChat(!addingFriendsToChat) }}
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
                    {!addingFriendsToChat
                    ?   <div className={styles["messages-container"]}>
                            <ul
                                className={styles["message-list"]}
                                aria-label="chat-message-list"
                            >
                                {chat.messages && Array.isArray(chat.messages) && chat.messages.length > 0
                                ?   chat.messages.toReversed().map((message) => {
                                        return (
                                            <li
                                                aria-label="chat-message"
                                                key={message._id}
                                            ><Message
                                                text={message.text}
                                                name={message.author.name}
                                                dateSent={message.createdAt}
                                                imageSrc={message.author.imageSrc}
                                                imageAlt={message.author.imageAlt}
                                                position={
                                                    userInfo &&
                                                    userInfo.hasOwnProperty("_id") &&
                                                    message.author.toString() === userInfo._id.toString() ?
                                                        "right" :
                                                        "left"
                                                }
                                            /></li>
                                        )
                                    })
                                :   <p
                                        className={styles["empty-chat-text"]}
                                        aria-label="empty-chat-text"
                                    >There are no messages in this chat yet!</p>}
                            </ul>
                        </div>
                    :   <FriendSelectorPanel
                            title="Add Friends to Chat"
                            removeButtonText="Remove"
                            addButtonText="Add"
                            submitButtonText="Add Friends"
                            noFriendsText="You have no friends you can add to this chat"
                            onCloseHandler={() => setAddingFriendsToChat(false)}
                            onSubmitHandler={() => {}}
                            submissionErrors={[]}
                        />
                    }
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

ChatPanel.defaultProps = {
    chatId: null,
}

export default ChatPanel;