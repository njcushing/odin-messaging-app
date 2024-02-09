import PropTypes from "prop-types";
import styles from "./index.module.css";

const ProfileImage = ({
    src,
    alt,
    sizePx,
}) => {
    return (
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
    );
};

ProfileImage.propTypes = {
    src: PropTypes.string,
    alt: PropTypes.string,
    sizePx: PropTypes.number.isRequired,
};

ProfileImage.defaultProps = {
    src: "",
    alt: "",
}

export default ProfileImage;