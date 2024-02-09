import PropTypes from "prop-types";
import styles from "./index.module.css";

import ProfileImage from "@/components/ProfileImage";

import formatDate from "./utils/formatDate";

const Message = ({
    text,
    name,
    dateSent,
    imageSrc,
    imageAlt,
    position,
}) => {
    const wrapperStyleRules = {
        justifyContent: position === "left" ? "start" : "end",
    }
    const containerStyleRules = {
        flexDirection: position === "left" ? "row" : "row-reverse",
    }
    const messageTextContainerStyleRules = {
        alignSelf: position === "left" ? "start" : "end",
    }
    const messageTextStyleRules = {
        backgroundColor: position === "left" ? "rgb(4, 187, 28)" : "rgb(4, 98, 187)",
        borderBottomLeftRadius: position === "right" ? "12px" : "0px",
        borderBottomRightRadius: position === "left" ? "12px" : "0px",
    }
    const nameAndDateStringStyleRules = {
        justifyContent: position === "left" ? "start" : "end",
    }

    return (
        <div
            className={styles["wrapper"]}
            style={{ ...wrapperStyleRules }}
        >
        <div
            className={styles["container"]}
            style={{ ...containerStyleRules }}
        >
            <ProfileImage
                src={""}
                alt={""}
                sizePx={50}
            />
            <div className={styles["message-info-container"]}>
                <div
                    className={styles["message-text-container"]}
                    style={{ ...messageTextContainerStyleRules }}
                >
                    <p
                        className={styles["message-text"]}
                        aria-label="message-text"
                        style={{ ...messageTextStyleRules }}
                    >{new DOMParser().parseFromString(text, "text/html").body.textContent}</p>
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
};

Message.defaultProps = {
    text: "",
    name: "",
    dateSent: "",
    imageSrc: "",
    imageAlt: "",
    position: "right",
};

export default Message;