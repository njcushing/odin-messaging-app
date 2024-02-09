import PropTypes from "prop-types";
import styles from "./index.module.css";

import ProfileImage from "@/components/ProfileImage";
import OptionButton from "@/components/OptionButton";

import formatDate from "./utils/formatDate";

const validateTypedArray = (value) => {
    return (ArrayBuffer.isView(value) && !(value instanceof DataView));
}

const Message = ({
    text,
    image,
    name,
    dateSent,
    profileImage,
    position,
    replyingTo,
    onReplyToHandler,
}) => {
    let imageSrc = null;
    if (image && image.constructor === Object) {
        if (validateTypedArray(image.src)) {
            const blob = new Blob([Buffer.from(image.src)], { type: "image/png" });
            imageSrc = URL.createObjectURL(blob);
        }
    }

    let replyingToImageSrc = null;
    if (replyingTo && replyingTo.constructor === Object){
        if (replyingTo.image && replyingTo.image.constructor === Object) {
            if (validateTypedArray(replyingTo.image.src)) {
                const blob = new Blob([Buffer.from(replyingTo.image.src)], { type: "image/png" });
                replyingToImageSrc = URL.createObjectURL(blob);
            }
        }
    }

    let replyingToElement = null;
    if (replyingTo && replyingTo.constructor === Object) {
        replyingToElement = (
            <div className={styles["replying-to-message-container"]}>
                <p
                    className={styles["replying-to-message-text"]}
                    aria-label="replying-to-message-text"
                >{`${replyingTo.author}: ${replyingTo.text ? replyingTo.text : ""}`}</p>
                {
                    replyingTo.image &&
                    replyingTo.image.constructor === Object &&
                    validateTypedArray(replyingTo.image.src)
                ?   <div className={styles["replying-to-message-image-container"]}>
                        <img
                            className={styles["replying-to-message-image"]}
                            aria-label="replying-to-message-image"
                            src={replyingToImageSrc}
                            alt={replyingTo.image.alt}
                        ></img>
                    </div>
                :   null}
            </div>
        );
    }

    return (
        <div
            className={styles["wrapper"]}
            position={position}
        >
        <div className={styles["container"]}>
            <div
                className={styles["profile-image"]}
                position={position}
            >
                <ProfileImage
                    src={profileImage.src}
                    alt={profileImage.alt}
                    status={profileImage.status}
                    sizePx={50}
                />
            </div>
            <div
                className={styles["message-container"]}
                position={position}
            >
                {text.length > 0
                ?   <p
                        className={styles["message-text"]}
                        aria-label="message-text"
                    >
                        {text}
                    </p>
                :   null}
                {image && image.constructor === Object
                ?   <div className={styles["message-image-container"]}>
                        <img
                            className={styles["message-image"]}
                            aria-label="message-image"
                            src={imageSrc}
                            alt={image.alt}
                        ></img>
                    </div>
                :   null}
                {replyingToElement}
            </div>
            <div
                className={styles["option-button"]}
                position={position}
            >
                <OptionButton
                    text="reply"
                    tooltipText=""
                    tooltipPosition="bottom"
                    widthPx={30}
                    heightPx={30}
                    fontSizePx={16}
                    borderType="circular"
                    onClickHandler={(e) => { onReplyToHandler(e); }}
                />
            </div>
            <p
                className={styles["name-and-date-string"]}
                aria-label="author-and-date"
                position={position}
            >
                {`${name} at ${formatDate(dateSent)}`}
            </p>
        </div>
        </div>
    );
};

Message.propTypes = {
    text: PropTypes.string,
    image: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.shape({
            src: function(props, propName, componentName) {
                const propValue = props[propName];
                if (!ArrayBuffer.isView(propValue) || propValue instanceof DataView) {
                    throw new Error(`'${propName}' prop in ${componentName} needs to be a
                    Typed Array (e.g. - Uint8Array); got ${typeof propValue}`);
                }
                return;
            },
            alt: PropTypes.string,
        }),
    ]),
    name: PropTypes.string,
    dateSent: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    profileImage: PropTypes.oneOfType([
        PropTypes.shape({ ...ProfileImage.propTypes }),
        PropTypes.number,
    ]),
    position: PropTypes.oneOf(["left", "right"]),
    replyingTo: PropTypes.oneOfType([PropTypes.shape({
        author: PropTypes.string,
        text: PropTypes.string,
        image: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.shape({
                src: function(props, propName, componentName) {
                    const propValue = props[propName]
                    if (!ArrayBuffer.isView(propValue) || propValue instanceof DataView) {
                        return new Error(`'${propName}' prop in ${componentName} needs to be a
                        Typed Array (e.g. - Uint8Array); got ${typeof propValue}`);
                    }
                    return;
                },
                alt: PropTypes.string,
            }),
        ]),
    }), PropTypes.number]),
    onReplyToHandler: PropTypes.func,
};

Message.defaultProps = {
    text: "",
    image: null,
    name: "",
    dateSent: "",
    profileImage: { ...ProfileImage.defaultProps },
    position: "right",
    replyingTo: null,
    onReplyToHandler: () => {},
};

export default Message;