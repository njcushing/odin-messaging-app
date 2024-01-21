import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.css";

import OptionButton from "@/components/OptionButton";
import FriendSelectorPanel from "./components/FriendSelectorPanel";
import ChatOption from "./components/ChatOption";
import ChatPanel from "./components/ChatPanel";

import createChat from "./utils/createChat.js";
import getChatsList from "./utils/getChatsList.js";

const isScrollbarAtBottom = (e) => {
    return e.target.scrollHeight === Math.ceil(e.target.scrollTop + e.target.getBoundingClientRect().height);
}

const ChatsPanel = ({
    createChatPanelOpenDefault,
    userId,
}) => {
    const [chatsList, setChatsList] = useState({
        currentValue: [],
        abortController: null,
        attempting: !createChatPanelOpenDefault,
        appending: false,
        page: 1,
    });
    const [creatingChat, setCreatingChat] = useState({
        panelOpen: createChatPanelOpenDefault,
        currentValue: [],
        abortController: null,
        attempting: false,
        submissionErrors: [],
    });
    const [chatSelectedId, setChatSelectedId] = useState(null);

    useEffect(() => {
        if (chatsList.abortController) chatsList.abortController.abort;
        const abortControllerNew = new AbortController();
        if (chatsList.attempting || chatsList.appending) {
            setChatsList({
                ...chatsList,
                abortController: abortControllerNew,
            });
            (async () => {
                const response = await getChatsList(chatsList.page, abortControllerNew);
                let chatsListNew = [];
                if (chatsList.attempting) {
                    chatsListNew = response.chats;
                } else {
                    chatsListNew = [...chatsList.currentValue, ...response.chats];
                }
                setChatsList({
                    ...chatsList,
                    currentValue: chatsListNew,
                    abortController: null,
                    attempting: false,
                    appending: false,
                });
            })();
        }

        return () => {
            if (chatsList.abortController) chatsList.abortController.abort;
        }
    }, [chatsList.attempting, chatsList.appending]);

    useEffect(() => {
        setChatsList({
            ...chatsList,
            appending: true,
        });
    }, [chatsList.page]);

    useEffect(() => {
        if (creatingChat.abortController) creatingChat.abortController.abort;
        const abortControllerNew = new AbortController();
        if (creatingChat.attempting) {
            setCreatingChat({
                ...creatingChat,
                abortController: abortControllerNew,
            });
            (async () => {
                const chatNew = await createChat(Array.from(creatingChat.currentValue), abortControllerNew);
                setCreatingChat({
                    panelOpen: false,
                    currentValue: [],
                    abortController: null,
                    attempting: false,
                    submissionErrors: chatNew.status >= 400 ? [chatNew.message] : []
                });
                if (chatNew.status < 400) {
                    setChatsList({
                        ...chatsList,
                        attempting: true,
                    })
                    setChatSelectedId(chatNew.chatId);
                }
            })();
        }
    }, [creatingChat.attempting]);

    const chatPanelElement = (
        <div className={styles["chat-panel"]}>
            <ChatPanel
                chatId={chatSelectedId}
                userId={userId}
                messageSentHandler={(message) => {
                    const chatsListNew = [...chatsList.currentValue];
                    const chatOptionToUpdate = chatsListNew.find((chat) => {
                        return chat._id.toString() === chatSelectedId.toString()
                    });
                    const chatsListOptionRemoved = chatsListNew.filter((chat) => {
                        return chat._id.toString() !== chatSelectedId.toString()
                    });
                    if (typeof chatOptionToUpdate !== "undefined") {
                        chatOptionToUpdate.messages[0] = message;
                        chatsListOptionRemoved.unshift(chatOptionToUpdate);
                        setChatsList({
                            ...chatsList,
                            currentValue: chatsListOptionRemoved,
                        });
                    }
                }}
                addedFriendsHandler={(chatId) => {
                    setGettingChatsList(true);
                    setChatSelectedId(chatId);
                }}
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
            onCloseHandler={() => setCreatingChat({
                ...creatingChat,
                panelOpen: false,
            })}
            onSubmitHandler={(participants) => {
                if (!creatingChat.attempting) {
                    setCreatingChat({
                        ...creatingChat,
                        currentValue: participants,
                        attempting: true,
                    })
                }
            }}
            submissionErrors={creatingChat.submissionErrors}
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
                                if (!creatingChat.attempting) {
                                    setCreatingChat({
                                        ...creatingChat,
                                        panelOpen: !creatingChat.panelOpen,
                                        submissionErrors: [],
                                    });
                                }
                            }}
                        />
                    </li>
                </ul>
                {!chatsList.attempting
                ?   <ul
                        className={styles["chat-options-list"]}
                        aria-label="chat-options-list"
                        key={"chat-options-list"}
                        onScroll={(e) => {
                            if (isScrollbarAtBottom(e)) {
                                setChatsList({
                                    ...chatsList,
                                    page: chatsList.page + 1,
                                });
                            }
                        }}
                    >
                        {chatsList.currentValue.map((chat) => {
                            return (
                                <li
                                    aria-label="chat-option"
                                    key={chat._id}
                                ><ChatOption
                                    chat={{...chat}}
                                    onClickHandler={() => {
                                        if (!creatingChat.attempting) {
                                            setChatSelectedId(chat._id);
                                            setCreatingChat({
                                                ...creatingChat,
                                                panelOpen: false,
                                            });
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
            {creatingChat.panelOpen
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