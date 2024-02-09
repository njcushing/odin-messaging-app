import PropTypes from "prop-types";
import styles from "./index.module.css";

import OptionButton from "@/components/OptionButton";

const OptionsSidebar = ({
    onOptionSelect,
}) => {
    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <div className={styles["chat-options"]}>
                <OptionButton
                    text="mood"
                    tooltipText="Friends"
                    tooltipPosition="right"
                    onClickHandler={() => onOptionSelect("friends")}
                />
                <OptionButton
                    text="chat"
                    tooltipText="Chats"
                    tooltipPosition="right"
                    onClickHandler={() => onOptionSelect("chats")}
                />
            </div>
            <div className={styles["settings-options"]}>
                <OptionButton
                    text="person"
                    tooltipText="Account Information"
                    tooltipPosition="right"
                    onClickHandler={() => onOptionSelect("account")}
                />
                <OptionButton
                    text="settings"
                    tooltipText="Settings"
                    tooltipPosition="right"
                    onClickHandler={() => onOptionSelect("settings")}
                />
                <OptionButton
                    text="logout"
                    tooltipText="Log Out"
                    tooltipPosition="right"
                    onClickHandler={() => {
                        localStorage.removeItem("odin-messaging-app-auth-token");
                        window.location.href = "/log-in";
                    }}
                />
            </div>
        </div>
        </div>
    );
};

OptionsSidebar.propTypes = {
    onOptionSelect: PropTypes.func.isRequired,
}

export default OptionsSidebar;