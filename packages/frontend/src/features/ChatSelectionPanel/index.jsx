import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.css";

import OptionButton from "@/components/OptionButton";
import AddFriendPanel from "./components/AddFriendPanel";
import ChatOption from "./components/ChatOption";
import ChatPanel from "./components/ChatPanel";

import * as getChatListFromAPI from "./utils/getChatListFromAPI.js";

const ChatSelectionPanel = ({
    chatType,
}) => {
    const [chatList, setChatList] = useState([]);
    const [addingFriend, setAddingFriend] = useState(false);

    useEffect(() => {
        (async () => {
            let chatListNew = [];
            switch (chatType) {
                case "friends":
                    chatListNew = await getChatListFromAPI.friends();
                    break;
                case "groups":
                    chatListNew = await getChatListFromAPI.groups();
                    break;
                case "communities":
                    chatListNew = await getChatListFromAPI.communities();
                    break;
                default:
                    chatListNew = [];
            }
            setChatList(chatListNew);
        })();
    }, [chatType]);

    let rightPanelContent = null;
    if (addingFriend) {
        rightPanelContent = (
            <AddFriendPanel
                onCloseHandler={() => setAddingFriend(false)}
                addFriendHandler={() => {}}
                addFriendSubmissionErrors={[]}
            />
        );
    } else {
        rightPanelContent = (
            <div className={styles["chat-panel"]}>
                <ChatPanel />
            </div>
        );
    }

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <div className={styles["chat-selection-panel"]}>
                <h3
                    className={styles["chat-list-title"]}
                    aria-label="chat-list-title"
                >{chatType}</h3>
                {chatType === "friends" || chatType === "groups"
                ?   <ul
                        className={styles["chat-selection-panel-options-list"]}
                        aria-label="chat-selection-panel-options-list"
                    >
                        {chatType === "friends"
                        ?   <li
                                className={styles["add-friend-button"]}
                                aria-label="add-friend-button"
                            >
                                <OptionButton
                                    text="person_add"
                                    tooltipText="Add Friend"
                                    tooltipPosition="bottom"
                                    widthPx={50}
                                    heightPx={50}
                                    fontSizePx={24}
                                    borderStyle="circular"
                                    onClickHandler={() => setAddingFriend(!addingFriend)}
                                />
                            </li>
                        :   null}
                        <li
                            className={styles["create-chat-button"]}
                            aria-label="create-chat-button"
                        >
                            <OptionButton
                                text="add"
                                tooltipText={
                                    chatType === "friends"
                                    ? "Create New Chat"
                                        : chatType === "groups"
                                        ? "Create New Group"
                                    : "Error"
                                }
                                tooltipPosition="bottom"
                                widthPx={50}
                                heightPx={50}
                                fontSizePx={24}
                                borderStyle="circular"
                                onClickHandler={() => {}}
                            />
                        </li>
                    </ul>
                :   null}
                <ul
                    className={styles["chat-list-options"]}
                    aria-label="chat-list-options"
                >
                    {chatList.map((chatOption, i) => {
                        return (
                            <li
                                aria-label="chat-option"
                                key={i}
                            ><ChatOption
                                name={chatOption.name}
                                tagLine={chatOption.tagLine}
                                status={chatOption.status}
                                imageSrc={chatOption.imageSrc}
                                imageAlt={chatOption.imageAlt}
                                onClickHandler={() => {}}
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

ChatSelectionPanel.propTypes = {
    chatType: PropTypes.oneOf(["friends", "groups", "communities"]).isRequired,
}

export default ChatSelectionPanel;