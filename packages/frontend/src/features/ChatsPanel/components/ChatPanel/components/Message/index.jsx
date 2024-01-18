import PropTypes from "prop-types";
import styles from "./index.module.css";

import ProfileImage from "@/components/ProfileImage";
import OptionButton from "@/components/OptionButton";

import formatDate from "./utils/formatDate";

const Message = ({
    text,
    name,
    dateSent,
    imageSrc,
    imageAlt,
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

    let replyingToElement = null;
    if (
        replyingTo !== null &&
        typeof replyingTo === "object" &&
        "author" in replyingTo &&
        "text" in replyingTo
    ) {
        replyingToElement = (
            <div className={styles["replying-to-text-container"]}>
                <p
                    className={styles["replying-to-text"]}
                    aria-label="replying-to-text"
                >{
                    new DOMParser().parseFromString(
                        `${replyingTo.author}: ${replyingTo.text}`, "text/html"
                    ).body.textContent
                }</p>
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
                    src={""}
                    alt={""}
                    sizePx={50}
                />
            </div>
            <div
                className={styles["message-text-container"]}
                style={{ ...messageTextContainerStyleRules }}
            >
                <p
                    className={styles["message-text"]}
                    aria-label="message-text"
                >
                    {new DOMParser().parseFromString(text, "text/html").body.textContent}
                </p>
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
    name: PropTypes.string,
    dateSent: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    imageSrc: PropTypes.string,
    imageAlt: PropTypes.string,
    position: PropTypes.oneOf(["left", "right"]),
    replyingTo: PropTypes.oneOfType([PropTypes.shape({
        author: PropTypes.string,
        text: PropTypes.string,
    }), PropTypes.number]),
    onReplyToHandler: PropTypes.func,
};

Message.defaultProps = {
    text: "",
    name: "",
    dateSent: "",
    imageSrc: "",
    imageAlt: "",
    position: "right",
    replyingTo: null,
    onReplyToHandler: () => {},
};

export default Message;