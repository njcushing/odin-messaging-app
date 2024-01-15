import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.css";

import ProfileImage from "@/components/ProfileImage";

import calculateChatOptionProps from "./utils/calculateChatOptionProps";

const ChatOption = ({
    chat,
    onClickHandler,
    userId,
}) => {
    const [chatProps, setChatProps] = useState({
        name: "",
        recentMessage: null,
        status: "offline",
        imageSrc: "",
        imageAlt: "",
    })

    useEffect(() => {
        const chatPropsNew = calculateChatOptionProps(chat, userId);
        setChatProps(chatPropsNew);
    }, [chat]);

    return (
        <div
            className={styles["container"]}
            aria-label="chat-option"
            tabIndex={0}
            onClick={(e) => {
                onClickHandler(e);
                e.currentTarget.blur();
                e.preventDefault();
            }}
            onMouseLeave={(e) => {
                e.currentTarget.blur();
            }}
        >   
            <div className={styles["image-container"]}>
                <ProfileImage
                    src={chatProps.imageSrc}
                    alt={chatProps.imageAlt}
                    status={chatProps.status}
                    sizePx={50}
                />
            </div>
            <div className={styles["texts"]}>
                <h4
                    className={styles["chat-name"]}
                    aria-label="chat-name"
                >{chatProps.name}</h4>
                {typeof chatProps.recentMessage === "object" && chatProps.recentMessage !== null
                ?   <h5
                        className={styles["most-recent-message"]}
                        aria-label="most-recent-message"
                    >{`${chatProps.recentMessage.author}: ${chatProps.recentMessage.message}`}</h5>
                :   null}
            </div>
        </div>
    );
};

ChatOption.propTypes = {
    chat: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    onClickHandler: PropTypes.func,
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

ChatOption.defaultProps = {
    chat: null,
    onClickHandler: () => {},
    userId: null,
};

export default ChatOption;