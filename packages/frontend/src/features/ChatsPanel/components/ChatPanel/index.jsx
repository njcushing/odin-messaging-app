import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.css";

import ProfileImage from "@/components/ProfileImage";
import OptionButton from "@/components/OptionButton";
import FriendSelectorPanel from "../FriendSelectorPanel";
import Message from "./components/Message"
import MessageBox from "./components/MessageBox";

import getChat from "./utils/getChat";
import combineParticipantNames from "../../utils/combineParticipantNames";

import mongoose from "mongoose";

const ChatPanel = ({
    chatId,
}) => {
    const [addingFriendsToChat, setAddingFriendsToChat] = useState(false);
    const [chat, setChat] = useState(null);
    const [getChatAC, setGetChatAC] = useState(null);
    const [messageSubmissionErrors, setMessageSubmissionErrors] = useState([]);

    useEffect(() => {
        if (mongoose.Types.ObjectId.isValid(chatId)) {
            reloadChat();
        } else {
            setChat(null);
        }

        return () => {
            if (getChatAC) getChatAC.abort;
        }
    }, [chatId]);

    const reloadChat = () => {
        if (getChatAC) getChatAC.abort;
        const getChatACNew = new AbortController();
        setGetChatAC(getChatACNew);
        (async () => {
            const chatNew = await getChat(getChatACNew);
            setChat(chatNew.chat);
        })();
    };

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
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
                    :   <h3
                            className={styles["chat-name-participants"]}
                            aria-label="chat-participants"
                        >{combineParticipantNames(chat.participants, 3)}</h3>
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
                            ?   chat.messages.map((message) => {
                                    return (
                                        <li
                                            aria-label="chat-message"
                                            key={message._id}
                                        ><Message
                                            text={message.text}
                                            name={message.author.name}
                                            dateSent={message.dateSent}
                                            imageSrc={message.author.imageSrc}
                                            imageAlt={message.author.imageAlt}
                                            position={message.author._id === "self" ? "right" : "left"}
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
                        submissionErrors={messageSubmissionErrors}
                        onSubmitHandler={() => {}}
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
        </div>
        </div>
    );
};

ChatPanel.defaultProps = {
    chatId: null,
}

export default ChatPanel;