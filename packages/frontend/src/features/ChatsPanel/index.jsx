import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.css";

import OptionButton from "@/components/OptionButton";
import FriendSelectorPanel from "./components/FriendSelectorPanel";
import ChatOption from "./components/ChatOption";
import ChatPanel from "./components/ChatPanel";

import createChat from "./utils/createChat.js";
import getChatsList from "./utils/getChatsList.js";

const ChatsPanel = ({
    creatingChatDefault,
}) => {
    const [chatsList, setChatsList] = useState([]);
    const [chatsListAC, setChatsListAC] = useState(null);
    const [creatingChat, setCreatingChat] = useState(creatingChatDefault);
    const [chatSelectedId, setChatSelectedId] = useState(null);

    useEffect(() => {
        updateChatsList();

        return () => {
            if (chatsListAC) chatsListAC.abort;
        }
    }, []);

    const updateChatsList = () => {
        if (chatsListAC) chatsListAC.abort;
        const chatsListACNew = new AbortController();
        setChatsListAC(chatsListACNew);
        (async () => {
            const response = await getChatsList(chatsListACNew);
            setChatsList(response.chats);
        })();
    }

    let rightPanelContent;
    if (creatingChat) {
        rightPanelContent = (
            <FriendSelectorPanel
                title="Create New Chat"
                removeButtonText="Remove"
                addButtonText="Add"
                submitButtonText="Create Chat"
                noFriendsText="You have no friends with whom you can create a chat"
                onCloseHandler={() => setCreatingChat(false)}
                onSubmitHandler={() => {}}
                submissionErrors={[]}
            />
        );
    } else {
        rightPanelContent = (
            <div className={styles["chat-panel"]}>
                <ChatPanel
                    chatId={chatSelectedId}
                />
            </div>
        );
    }

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <div className={styles["chats-panel"]}>
                <h3
                    className={styles["chats-panel-title"]}
                    aria-label="chats-panel-title"
                >Chats</h3>
                <ul
                    className={styles["chats-panel-options"]}
                    aria-label="chats-panel-options"
                >
                    <li
                        className={styles["create-chat-button"]}
                        aria-label="create-chat-button"
                    >
                        <OptionButton
                            text="add"
                            tooltipText="Create New Chat"
                            tooltipPosition="bottom"
                            widthPx={50}
                            heightPx={50}
                            fontSizePx={24}
                            borderStyle="circular"
                            onClickHandler={() => setCreatingChat(!creatingChat)}
                        />
                    </li>
                </ul>
                <ul
                    className={styles["chat-options-list"]}
                    aria-label="chat-options-list"
                    key={"chat-options-list"}
                >
                    {chatsList.map((chat) => {
                        return (
                            <li
                                aria-label="chat-option"
                                key={chat._id}
                            ><ChatOption
                                name={chat.name}
                                participants={chat.participants}
                                recentMessage={chat.recentMessage}
                                status={chat.status}
                                imageSrc={chat.imageSrc}
                                imageAlt={chat.imageAlt}
                                onClickHandler={() => setChatSelectedId(chat._id)}
                            /></li>
                        );
                    })}
                </ul>
            </div>
            {rightPanelContent}
        </div>
        </div>
    );
};

ChatsPanel.propTypes = {
    creatingChatDefault: PropTypes.bool,
}

ChatsPanel.defaultProps = {
    creatingChatDefault: false,
}

export default ChatsPanel;