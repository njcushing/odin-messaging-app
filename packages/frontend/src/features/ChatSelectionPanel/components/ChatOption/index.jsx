import PropTypes from "prop-types";
import styles from "./index.module.css";

import ProfileImage from "@/components/ProfileImage";

const ChatOption = ({
    name,
    tagLine,
    status,
    imageSrc,
    imageAlt,
    onClickHandler,
}) => {
    return (
        <li
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
                <h4
                    className={styles["display-name"]}
                    aria-label="display-name"
                >{name}</h4>
                {tagLine.length > 0
                ?   <h4
                        className={styles["tag-line"]}
                        aria-label="tag-line"
                    >{tagLine}</h4>
                :   null}
            </div>
        </li>
    );
};

ChatOption.propTypes = {
    name: PropTypes.string.isRequired,
    tagLine: PropTypes.string,
    status: PropTypes.oneOf([null, "online", "away", "busy", "offline"]),
    imageSrc: PropTypes.string,
    imageAlt: PropTypes.string,
    onClickHandler: PropTypes.func,
};

ChatOption.defaultProps = {
    tagLine: "",
    status: null,
    imageSrc: "",
    imageAlt: "",
    onClickHandler: () => {},
}

export default ChatOption;