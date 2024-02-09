import PropTypes from "prop-types";
import styles from "./index.module.css";

const ProfileImage = ({
    src,
    alt,
    status,
    sizePx,
}) => {
    const blob = new Blob([Buffer.from(src)], { type: "image/png" });
    const imgSrc = URL.createObjectURL(blob);

    return (
        <div className={styles["container"]}>
        <img
            className={styles["profile-image"]}
            aria-label="profile-image"
            src={imgSrc}
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
                    outlineWidth: `${Math.floor(sizePx / 11)}px`,

                    height: `${Math.floor(sizePx / 3)}px`,
                    width: `${Math.floor(sizePx / 3)}px`,
                }}
                statusid={status}
            ></div>
        :   null}
        </div>
    );
};

ProfileImage.propTypes = {
    src: function(props, propName, componentName) {
        const propValue = props[propName]
        if (!ArrayBuffer.isView(propValue) || propValue instanceof DataView) {
            return new Error(`'${propName}' prop in ${componentName} needs to be a
            Typed Array (e.g. - Uint8Array); got ${typeof propValue}`);
        }
        return;
    },
    alt: PropTypes.string,
    status: PropTypes.oneOf([null, "online", "away", "busy", "offline"]),
    sizePx: PropTypes.number,
};

ProfileImage.defaultProps = {
    src: new Uint8Array([]),
    alt: "image",
    status: null,
    sizePx: 50,
}

export default ProfileImage;