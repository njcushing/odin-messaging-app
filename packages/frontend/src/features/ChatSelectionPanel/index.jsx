import PropTypes from "prop-types";
import styles from "./index.module.css";

const ChatSelectionPanel = ({
    chatType,
}) => {
    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
        </div>
        </div>
    );
};

ChatSelectionPanel.propTypes = {
    chatType: PropTypes.oneOf(["friends", "groups", "communities"]).isRequired,
}

export default ChatSelectionPanel;