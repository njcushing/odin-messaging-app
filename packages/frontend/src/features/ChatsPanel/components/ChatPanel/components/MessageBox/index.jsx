import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.css";

import * as validateMessage from "../../../../../../../../../utils/validateMessageFields.js";

const MessageBox = ({
    text,
    placeholder,
    submissionErrors,
    onSubmitHandler,
    sending,
}) => {
    const textareaRef = useRef(null);

    useEffect(() => {
        if (textareaRef.current) textareaRef.current.value = text;
    }, [text]);

    return (    
        <div
            className={styles["message-box"]}
            aria-label="message-box"
        >
            <textarea
                className={styles["message-text-box"]}
                aria-label="message-text-box"
                id="text"
                name="text"
                defaultValue={text}
                placeholder={placeholder}
                required
                style={{
                    resize: "none"
                }}
                disabled={sending}
                ref={textareaRef}
            ></textarea>
            <div className={styles["send-options-container"]}>
                <label
                    className={styles[`browse-button`]}
                    aria-label="browse-images"
                >Upload
                    <input
                        className={styles["image-input"]}
                        aria-label="upload-image"
                        type="file"
                        accept="image/*"
                        disabled={sending}
                        onChange={(e) => {
                            const file = new FileReader();
                            file.readAsArrayBuffer(e.target.files[0]);
                            file.onloadend = (e) => {
                                const imgArray = Array.from(new Uint8Array(e.target.result));
                                const validValue = validateMessage.image(imgArray);
                                if (validValue.status) {
                                    onSubmitHandler({
                                        type: "image",
                                        value: imgArray,
                                    });
                                }
                            }
                        }}
                    ></input>
                </label>
                <button
                    className={styles["send-message-button"]}
                    aria-label="send-message-button"
                    type="submit"
                    disabled={sending}
                    onClick={(e) => {
                        onSubmitHandler({
                            type: "text",
                            value: textareaRef.current.value,
                        });
                        e.currentTarget.blur();
                        e.preventDefault();
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.blur();
                    }}
                >Send</button>
            </div>
            {submissionErrors.length > 0
            ?   <div className={styles["message-submission-errors"]}>
                    <h4
                        className={styles["message-submission-errors-title"]}
                        aria-label="message-submission-errors-title"
                    >Error(s):</h4>
                    <ul
                        className={styles["message-submission-errors-list"]}
                        aria-label="message-submission-errors-list"
                    >
                        {submissionErrors.map((error, i) => {
                            return <li
                                className={styles["message-submission-error-item"]}
                                aria-label="message-submission-error-item"
                                key={i}
                            >{error}</li>
                        })}
                    </ul>
                </div>
            :   null}
        </div>
    );
};

MessageBox.propTypes = {
    message: PropTypes.string,
    placeholder: PropTypes.string,
    submissionErrors: PropTypes.arrayOf(PropTypes.string),
    onSubmitHandler: PropTypes.func,
    sending: PropTypes.bool,
}

MessageBox.defaultProps = {
    message: "",
    placeholder: "Write your message",
    submissionErrors: [],
    onSubmitHandler: () => {},
    sending: false,
}

export default MessageBox;