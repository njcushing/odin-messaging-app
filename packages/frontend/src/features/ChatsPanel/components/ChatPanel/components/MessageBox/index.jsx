import PropTypes from "prop-types";
import styles from "./index.module.css";

const MessageBox = ({
    text,
    placeholder,
    submissionErrors,
    onSubmitHandler,
}) => {
    return (    
        <form
            className={styles["message-box"]}
            aria-label="message-form"
            method="POST"
            action=""
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
            ></textarea>
            <button
                className={styles["send-message-button"]}
                aria-label="send-message-button"
                type="submit"
                onClick={(e) => {
                    onSubmitHandler(e);
                    e.currentTarget.blur();
                    e.preventDefault();
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.blur();
                }}
            >Send</button>
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
        </form>
    );
};

MessageBox.propTypes = {
    message: PropTypes.string,
    placeholder: PropTypes.string,
    submissionErrors: PropTypes.arrayOf(PropTypes.string),
    onSubmitHandler: PropTypes.func,
}

MessageBox.defaultProps = {
    message: "",
    placeholder: "Write your message",
    submissionErrors: [],
    onSubmitHandler: () => {},
}

export default MessageBox;