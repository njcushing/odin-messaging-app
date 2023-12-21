import PropTypes from "prop-types";
import styles from "./index.module.css";

import ProfileImage from "@/components/ProfileImage";

const Message = ({
    text,
    imageSrc,
    imageAlt,
    position,
}) => {
    const wrapperStyleRules = {
        justifyContent: position === "left" ? "start" : "end",
    }
    const containerStyleRules = {
        gridTemplateColumns: position === "right" ? "1fr auto" : "auto 1fr",
    }
    const messageTextContainerStyleRules = {
        order: position === "left" ? 1 : -1,
        backgroundColor: position === "left" ? "rgb(4, 187, 28)" : "rgb(4, 98, 187)",
        borderBottomLeftRadius: position === "right" ? "12px" : "0px",
        borderBottomRightRadius: position === "left" ? "12px" : "0px",
    }

    return (
        <div
            className={styles["wrapper"]}
            style={{
                ...wrapperStyleRules,
            }}
        >
        <div
            className={styles["container"]}
            style={{
                ...containerStyleRules,
            }}
        >
            <ProfileImage
                src={""}
                alt={""}
                sizePx={50}
            />
            <div
                className={styles["message-text-container"]}
                style={{
                    ...messageTextContainerStyleRules,
                }}
            >
                <p
                    className={styles["message-text"]}
                    aria-label="message-text"
                >{text}</p>
            </div>
        </div>
        </div>
    );
};

Message.propTypes = {
    text: PropTypes.string,
    imageSrc: PropTypes.string,
    imageAlt: PropTypes.string,
    position: PropTypes.oneOf(["left", "right"]),
};

Message.defaultProps = {
    text: "",
    imageSrc: "",
    imageAlt: "",
    position: "right",
};

export default Message;