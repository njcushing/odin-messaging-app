import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.css";

import ChatOption from "./components/ChatOption";
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
                <h3
                    className={styles["chat-list-title"]}
                    aria-label="chat-list-title"
                >{chatType}</h3>
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