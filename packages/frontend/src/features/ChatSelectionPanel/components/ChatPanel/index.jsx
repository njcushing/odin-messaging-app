import { useState, useEffect } from "react";
import propTypes from "prop-types";
import styles from "./index.module.css";

import ProfileImage from "@/components/ProfileImage";
import OptionButton from "@/components/OptionButton";
import Message from "../Message"
import MessageBox from "../MessageBox";

import getChatFromAPI from "./utils/getChatFromAPI";
import combineParticipantNames from "./utils/combineParticipantNames";

const ChatPanel = () => {
    const [chat, setChat] = useState({});
    const [messageSubmissionErrors, setMessageSubmissionErrors] = useState([]);

    useEffect(() => {
        (async () => {
            const chatNew = await getChatFromAPI();
            setChat(chatNew);
        })();
    }, []);

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <div
                className={styles["top-bar"]}
            >
                <ProfileImage
                    src={""}
                    alt={""}
                    sizePx={50}
                />
                {chat.chatName !== ""
                ?   <h3
                        className={styles["chat-name-custom"]}
                        aria-label="chat-name"
                    >{chat.chatName}</h3>
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
                        onClickHandler={() => {}}
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
            <div className={styles["messages-container"]}>
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
                    :   <h5
                            className={styles["empty-chat-text"]}
                            aria-label="empty-chat-text"
                        >There are no messages in this chat yet!</h5>}
                </ul>
            </div>
            <div
                className={styles["text-editor-container"]}
            >
                <MessageBox
                    submissionErrors={messageSubmissionErrors}
                    onSubmitHandler={() => {}}
                />
            </div>
        </div>
        </div>
    );
};

export default ChatPanel;