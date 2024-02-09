import { useState, useEffect, useRef } from "react";
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
    const [toggling, setToggling] = useState(false);
    const [toggledPanel, setToggledPanel] = useState("left");
    const [chatsList, setChatsList] = useState({
        currentValue: [],
        abortController: new AbortController(),
        attempting: true,
        appending: false,
    });
    const [creatingChat, setCreatingChat] = useState({
        panelOpen: createChatPanelOpenDefault,
        currentValue: [],
        abortController: new AbortController(),
        attempting: false,
        submissionErrors: [],
    });
    const [chatSelectedId, setChatSelectedId] = useState(null);

    const containerRef = useRef(null);

    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            if(!toggling && entries[0].contentRect.width < 540) {
                setToggling(true);
            }
            if(toggling && entries[0].contentRect.width >= 540) {
                setToggling(false);
            }
        })
        observer.observe(containerRef.current)
        return () => containerRef.current && observer.unobserve(containerRef.current)
    }, [toggling]);

    useEffect(() => {
        if (chatsList.abortController) chatsList.abortController.abort;
        const abortControllerNew = new AbortController();
        if (chatsList.attempting || chatsList.appending) {
            setChatsList({
                ...chatsList,
                abortController: abortControllerNew,
            });
            (async () => {
                const response = await getChatsList([
                    chatsList.currentValue.length,
                    chatsList.currentValue.length + 20
                ], abortControllerNew);
                setChatsList({
                    ...chatsList,
                    currentValue: [...chatsList.currentValue, ...response.chats],
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
        if (creatingChat.abortController) creatingChat.abortController.abort;
        const abortControllerNew = new AbortController();
        if (creatingChat.attempting) {
            setCreatingChat({
                ...creatingChat,
                abortController: abortControllerNew,
            });
            (async () => {
                let participants = [];
                if (creatingChat.currentValue instanceof Set) {
                    participants = Array.from(creatingChat.currentValue);
                }
                const chatNew = await createChat(participants, abortControllerNew);
                setCreatingChat({
                    panelOpen: false,
                    abortController: null,
                    attempting: false,
                    submissionErrors: chatNew.status >= 400 ? [chatNew.message] : []
                });
                if (chatNew.status < 400) {
                    setChatsList({
                        ...chatsList,
                        currentValue: [],
                        attempting: true,
                    })
                    setChatSelectedId(chatNew.chatId);
                }
            })();
        }
    }, [creatingChat.attempting]);

    const chatPanelElement = (
        <div className={styles["chat-panel"]}>
            <>
            {toggling && toggledPanel === "right" ?
                <div className={styles["return-to-chat-list-option-button"]}>
                    <OptionButton
                        text="arrow_back"
                        label="return to chat list"
                        tooltipText="Return to Chat List"
                        tooltipPosition="right"
                        widthPx={36}
                        heightPx={36}
                        fontSizePx={23}
                        borderType="circular"
                        onClickHandler={() => {
                            if (!creatingChat.attempting) setToggledPanel("left");
                        }}
                    />
                </div>
            :   null
            }
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
                        if (typeof chatOptionToUpdate.messages === "undefined") {
                            chatOptionToUpdate.messages = [];
                        }
                        chatOptionToUpdate.messages[0] = message;
                        chatsListOptionRemoved.unshift(chatOptionToUpdate);
                        setChatsList({
                            ...chatsList,
                            currentValue: chatsListOptionRemoved,
                        });
                    }
                }}
                addedFriendsHandler={(chatId) => {
                    setChatsList({
                        ...chatsList,
                        currentValue: [],
                        attempting: true,
                    })
                    setChatSelectedId(chatId);
                }}
                updatedChatImageHandler={() => {
                    setChatsList({
                        ...chatsList,
                        currentValue: [],
                        attempting: true,
                    })
                }}
                key={chatSelectedId}
            />
            </>
        </div>
    );

    const friendSelectorPanelElement = (
        <div className={styles["create-new-chat-panel"]}>
            <FriendSelectorPanel
                title="Create New Chat"
                removeButtonText="Remove"
                addButtonText="Add"
                submitButtonText="Create Chat"
                noFriendsText="You have no friends with whom you can create a chat"
                onCloseHandler={() => {
                    setCreatingChat({
                        ...creatingChat,
                        panelOpen: false,
                    });
                    if (toggling) setToggledPanel("left");
                }}
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
        </div>
    );
    
    const leftSideContent = (
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
                        label="create-chat"
                        tooltipText="Create New Chat"
                        tooltipPosition="bottom"
                        widthPx={50}
                        heightPx={50}
                        fontSizePx={24}
                        borderType="circular"
                        onClickHandler={() => {
                            if (!creatingChat.attempting) {
                                setCreatingChat({
                                    ...creatingChat,
                                    panelOpen: !creatingChat.panelOpen,
                                    submissionErrors: [],
                                });
                                if (toggling) setToggledPanel(toggledPanel === "left" ? "right" : "left");
                            }
                        }}
                    />
                </li>
            </ul>
            {!chatsList.attempting
            ?   <div className={styles["scrollable-wrapper"]}>
                    <ul
                        className={styles["chat-options-list"]}
                        aria-label="chat-options-list"
                        key={"chat-options-list"}
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
                                            if (toggling) setToggledPanel("right");
                                        }
                                    }}
                                    userId={userId}
                                /></li>
                            );
                        })}
                        <button
                            className={styles["load-more-button"]}
                            aria-label="load-more"
                            onClick={(e) => {
                                if (!chatsList.appending) {
                                    setChatsList({
                                        ...chatsList,
                                        appending: true,
                                    });
                                }
                                e.currentTarget.blur();
                                e.preventDefault();
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.blur();
                            }}
                        >{!chatsList.appending
                        ?   "Load More"
                        :   <div className={styles["load-more-button-waiting-wheel-container"]}>
                                <div
                                    className={styles["load-more-button-waiting-wheel"]}
                                    aria-label="waiting"
                                ></div>
                            </div>
                        }</button>
                    </ul>
                </div>
            :   <div className={styles["waiting-wheel-container"]}>
                    <div
                        className={styles["waiting-wheel"]}
                        aria-label="attempting-create-account"
                    ></div>
                </div>
            }
        </div>
    );

    const rightSideContent = creatingChat.panelOpen ? friendSelectorPanelElement : chatPanelElement;

    let allContent = null;
    if (toggling) {
        if (toggledPanel === "left") allContent = leftSideContent;
        if (toggledPanel === "right") allContent = rightSideContent;
    } else {
        allContent = (
            <>
            {leftSideContent}
            {rightSideContent}
            </>
        );
    }

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]} ref={containerRef}>
            {allContent}
        </div>
        </div>
    );
};


ChatsPanel.defaultProps = {
    createChatPanelOpenDefault: false,
    userId: null,
}

export default ChatsPanel;