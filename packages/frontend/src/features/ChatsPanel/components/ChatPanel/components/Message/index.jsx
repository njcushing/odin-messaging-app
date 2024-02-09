import PropTypes from "prop-types";
import styles from "./index.module.css";

import ProfileImage from "@/components/ProfileImage";
import OptionButton from "@/components/OptionButton";

import formatDate from "./utils/formatDate";

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
    const wrapperStyleRules = {
        justifyContent: position === "left" ? "start" : "end",
    }
    const messageTextContainerStyleRules = {
        alignSelf: position === "left" ? "start" : "end",
        backgroundColor: position === "left" ? "rgb(4, 187, 28)" : "rgb(4, 98, 187)",
        borderBottomLeftRadius: position === "right" ? "12px" : "0px",
        borderBottomRightRadius: position === "left" ? "12px" : "0px",
    }
    const profileImageStyleRules = {
        gridArea: position === "left" ? "1 / 1 / -1 / 2" : "1 / 3 / -1 / -1",
    }
    const replyButtonStyleRules = {
        gridArea: position === "left" ? "1 / 3 / 2 / -1" : "1 / 1 / 2 / 2",
    }
    const nameAndDateStringStyleRules = {
        justifyContent: position === "left" ? "start" : "end",
        gridArea: position === "left" ? "2 / 2 / -1 / -1" : "2 / 1 / -1 / 3",
    }

    let imageSrc = null;
    if (image && image.constructor === Object) {
        const blob = new Blob([Buffer.from(image.src)], { type: "image/png" });
        imageSrc = URL.createObjectURL(blob);
    }

    let replyingToImageSrc = null;
    if (replyingTo && replyingTo.constructor === Object){
        if (replyingTo.image && replyingTo.image.constructor === Object) {
            const blob = new Blob([Buffer.from(replyingTo.image.src)], { type: "image/png" });
            replyingToImageSrc = URL.createObjectURL(blob);
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
                {replyingTo.image && replyingTo.image.constructor === Object
                ?   <div className={styles["replying-to-message-image-container"]}>
                        <img
                            className={styles["replying-to-message-image"]}
                            aria-label="replying-to-message-image"
                            src={replyingToImageSrc}
                            alt={image.alt}
                        ></img>
                    </div>
                :   null}
            </div>
        );
    }

    return (
        <div
            className={styles["wrapper"]}
            style={{ ...wrapperStyleRules }}
        >
        <div className={styles["container"]}>
            <div
                className={styles["profile-image"]}
                style={{ ...profileImageStyleRules }}
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
                style={{ ...messageTextContainerStyleRules }}
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
                style={{ ...replyButtonStyleRules }}
            >
                <OptionButton
                    text="reply"
                    tooltipText=""
                    tooltipPosition="bottom"
                    widthPx={30}
                    heightPx={30}
                    fontSizePx={16}
                    borderStyle="circular"
                    onClickHandler={(e) => { onReplyToHandler(e); }}
                />
            </div>
            <p
                className={styles["name-and-date-string"]}
                aria-label="author-and-date"
                style={{ ...nameAndDateStringStyleRules }}
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
    name: PropTypes.string,
    dateSent: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    profileImage: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.shape({ ...ProfileImage.propTypes }),
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