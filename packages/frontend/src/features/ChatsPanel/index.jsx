import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.css";

import OptionButton from "@/components/OptionButton";
import FriendSelectorPanel from "./components/FriendSelectorPanel";
import ChatOption from "./components/ChatOption";
import ChatPanel from "./components/ChatPanel";

import createChat from "./utils/createChat.js";
import getChatsList from "./utils/getChatsList.js";

const ChatsPanel = ({
    createChatPanelOpenDefault,
    userId,
}) => {
    const [chatsList, setChatsList] = useState([]);
    const [gettingChatsList, setGettingChatsList] = useState(false);
    const [chatsListAC, setChatsListAC] = useState(null);
    const [createChatPanelOpen, setCreateChatPanelOpen] = useState(createChatPanelOpenDefault);
    const [creatingChatParticipants, setCreatingChatParticipants] = useState([]);
    const [creatingChat, setCreatingChat] = useState(false);
    const [creatingChatSubmissionErrors, setCreatingChatSubmissionErrors] = useState([]);
    const [chatSelectedId, setChatSelectedId] = useState(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        updateChatsList();
        setGettingChatsList(true);

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
            setGettingChatsList(false);
        })();
    }

    useEffect(() => {
        if (creatingChat) {
            (async () => {
                const chatNew = await createChat(Array.from(creatingChatParticipants));
                if (chatNew.status < 400) {
                    setChatSelectedId(chatNew.chatId);
                    setCreateChatPanelOpen(false);
                    setCreatingChatSubmissionErrors([]);
                    updateChatsList();
                } else {
                    setCreatingChatSubmissionErrors([chatNew.message]);
                }
            })();
            setCreatingChatParticipants([]);
            setCreatingChat(false);
        }
    }, [creatingChat]);

    const chatPanelElement = (
        <div className={styles["chat-panel"]}>
            <ChatPanel
                chatId={chatSelectedId}
                userId={userId}
                key={chatSelectedId}
            />
        </div>
    );

    const friendSelectorPanelElement = (
        <FriendSelectorPanel
            title="Create New Chat"
            removeButtonText="Remove"
            addButtonText="Add"
            submitButtonText="Create Chat"
            noFriendsText="You have no friends with whom you can create a chat"
            onCloseHandler={() => setCreateChatPanelOpen(false)}
            onSubmitHandler={(participants) => {
                if (!creatingChat) {
                    setCreatingChatParticipants(participants);
                    setCreatingChat(true);
                }
            }}
            submissionErrors={creatingChatSubmissionErrors}
        />
    );

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
                            onClickHandler={() => {
                                if (!creatingChat) {
                                    setCreateChatPanelOpen(!createChatPanelOpen);
                                    setCreatingChatSubmissionErrors([]);
                                }
                            }}
                        />
                    </li>
                </ul>
                {!gettingChatsList
                ?   <ul
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
                                    chat={chat}
                                    onClickHandler={() => {
                                        if (!creatingChat) {
                                            setChatSelectedId(chat._id);
                                            setCreateChatPanelOpen(false);
                                        }
                                    }}
                                    userId={userId}
                                /></li>
                            );
                        })}
                    </ul>
                :   <div className={styles["waiting-wheel-container"]}>
                        <div
                            className={styles["waiting-wheel"]}
                            aria-label="attempting-create-account"
                        ></div>
                    </div>
                }
            </div>
            {createChatPanelOpen
            ?   friendSelectorPanelElement   
            :   chatPanelElement
            }
        </div>
        </div>
    );
};

ChatsPanel.propTypes = {
    createChatPanelOpenDefault: PropTypes.bool,
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

ChatsPanel.defaultProps = {
    createChatPanelOpenDefault: false,
    userId: null,
}

export default ChatsPanel;