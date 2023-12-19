import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.css";

import ChatPanel from "./components/ChatPanel";

import * as getChatListFromAPI from "./utils/getChatListFromAPI.js";

const ChatSelectionPanel = ({
    chatType,
}) => {
    const [chatList, setChatList] = useState([]);

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

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <ul className={styles["chat-list"]}>
                {chatList.map((chatOption, i) => {
                    return (
                        <li
                            className={styles["chat-option"]}
                            key={i}
                        >
                            {chatOption.displayName}
                        </li>
                    );
                })}
            </ul>
            <div className={styles["chat-panel"]}>
                <ChatPanel />
            </div>
        </div>
        </div>
    );
};

ChatSelectionPanel.propTypes = {
    chatType: PropTypes.oneOf(["friends", "groups", "communities"]).isRequired,
}

export default ChatSelectionPanel;