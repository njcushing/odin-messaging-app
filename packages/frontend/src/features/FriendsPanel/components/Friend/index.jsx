import PropTypes from "prop-types";
import styles from "./index.module.css";

import ProfileImage from "@/components/ProfileImage";

const Friend = ({
    username,
    tagLine,
    profileImage,
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
                    src={profileImage.src}
                    alt={profileImage.alt}
                    status={profileImage.status}
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
    profileImage: PropTypes.shape({ ...ProfileImage.propTypes }),
    onClickHandler: PropTypes.func,
};

Friend.defaultProps = {
    tagLine: "",
    profileImage: { ...ProfileImage.defaultProps },
    onClickHandler: () => {},
}

export default Friend;