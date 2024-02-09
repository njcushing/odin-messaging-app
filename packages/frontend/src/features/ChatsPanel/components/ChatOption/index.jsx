import PropTypes from "prop-types";
import styles from "./index.module.css";

import ProfileImage from "@/components/ProfileImage";
import combineParticipantNames from "../../utils/combineParticipantNames.js";

const ChatOption = ({
    name,
    participants,
    recentMessage,
    status,
    imageSrc,
    imageAlt,
    onClickHandler,
}) => {
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
                    src={imageSrc}
                    alt={imageAlt}
                    sizePx={50}
                />
            </div>
            {status !== null
            ?   <div
                    className={styles["status-indicator"]}
                    aria-label="status-indicator"
                ></div>
            :   null}
            <div className={styles["texts"]}>
                {name.length > 0
                ?   <h4
                        className={styles["chat-name"]}
                        aria-label="chat-name"
                    >{name}</h4>
                :   <>
                    {participants.length > 0
                    ?   <h4
                            className={styles["chat-name-participants"]}
                            aria-label="chat-participants"
                        >{combineParticipantNames(participants, 2)}</h4>
                    :   <h4
                            className={styles["chat-name"]}
                            aria-label="chat-name"
                        >Chat</h4>
                    }
                    </>
                }
                {typeof recentMessage === "object" && recentMessage !== null
                ?   <h5
                        className={styles["most-recent-message"]}
                        aria-label="most-recent-message"
                    >{`${recentMessage.author}: ${recentMessage.message}`}</h5>
                :   null}
            </div>
        </div>
    );
};

ChatOption.propTypes = {
    name: PropTypes.string,
    participants: PropTypes.arrayOf(PropTypes.string),
    recentMessage: PropTypes.oneOfType([PropTypes.number, PropTypes.shape({
        author: PropTypes.string,
        message: PropTypes.string,
    })]),
    status: PropTypes.oneOf([null, "online", "away", "busy", "offline"]),
    imageSrc: PropTypes.string,
    imageAlt: PropTypes.string,
    onClickHandler: PropTypes.func,
};

ChatOption.defaultProps = {
    name: "",
    participants: [],
    recentMessage: {
        author: "",
        message: "",
    },
    status: null,
    imageSrc: "",
    imageAlt: "",
    onClickHandler: () => {},
}

export default ChatOption;