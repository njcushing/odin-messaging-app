import PropTypes from "prop-types";
import styles from "./index.module.css";

import ProfileImage from "@/components/ProfileImage";

const Friend = ({
    username,
    tagLine,
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
                    status={status}
                    sizePx={50}
                />
            </div>
            <div className={styles["texts"]}>
                <h4
                    className={styles["display-name"]}
                    aria-label="display-name"
                >{username}</h4>
                {tagLine.length > 0
                ?   <h4
                        className={styles["tag-line"]}
                        aria-label="tag-line"
                    >{tagLine}</h4>
                :   null}
            </div>
        </div>
    );
};

Friend.propTypes = {
    username: PropTypes.string.isRequired,
    tagLine: PropTypes.string,
    status: PropTypes.oneOf([null, "online", "away", "busy", "offline"]),
    imageSrc: PropTypes.string,
    imageAlt: PropTypes.string,
    onClickHandler: PropTypes.func,
};

Friend.defaultProps = {
    tagLine: "",
    status: null,
    imageSrc: "",
    imageAlt: "",
    onClickHandler: () => {},
}

export default Friend;