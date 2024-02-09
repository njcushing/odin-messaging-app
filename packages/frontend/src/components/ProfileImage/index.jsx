import PropTypes from "prop-types";
import styles from "./index.module.css";

const ProfileImage = ({
    src,
    alt,
    status,
    sizePx,
}) => {
    let statusIndicatorBackgroundColor;
    switch (status) {
        case "online":
            statusIndicatorBackgroundColor = "rgb(46, 196, 0)";
            break;
        case "away":
            statusIndicatorBackgroundColor = "rgb(196, 118, 0)";
            break;
        case "busy":
            statusIndicatorBackgroundColor = "rgb(192, 6, 0)";
            break;
        case "offline":
            statusIndicatorBackgroundColor = "rgb(170, 170, 170)";
            break;
    }

    return (
        <div className={styles["container"]}>
        <img
            className={styles["profile-image"]}
            aria-label="profile-image"
            src={src}
            alt={alt}
            style={{
                height: `${sizePx}px`,
                width: `${sizePx}px`,
            }}
        ></img>
        {status
        ?   <div
                className={styles["status-indicator"]}
                aria-label="status-indicator"
                style={{
                    outline: `${Math.floor(sizePx / 11)}px solid var(--color-background-front)`,
                    backgroundColor: statusIndicatorBackgroundColor,

                    height: `${Math.floor(sizePx / 3)}px`,
                    width: `${Math.floor(sizePx / 3)}px`,
                }}
            ></div>
        :   null}
        </div>
    );
};

ProfileImage.propTypes = {
    src: PropTypes.string,
    alt: PropTypes.string,
    status: PropTypes.oneOf([null, "online", "away", "busy", "offline"]),
    sizePx: PropTypes.number.isRequired,
};

ProfileImage.defaultProps = {
    src: "",
    alt: "",
    status: null,
}

export default ProfileImage;