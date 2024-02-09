import PropTypes from "prop-types";
import styles from "./index.module.css";

import OptionButton from "./components/OptionButton";

const OptionsSidebar = ({
    onOptionSelect,
}) => {
    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <div className={styles["chat-options"]}>
                <OptionButton
                    text="mood"
                    onClickHandler={() => onOptionSelect("friends")}
                />
                <OptionButton
                    text="groups"
                    onClickHandler={() => onOptionSelect("groups")}
                />
                <OptionButton
                    text="communities"
                    onClickHandler={() => onOptionSelect("communities")}
                />
            </div>
            <div className={styles["settings-options"]}>
                <OptionButton
                    text="person"
                    onClickHandler={() => onOptionSelect("account")}
                />
                <OptionButton
                    text="settings"
                    onClickHandler={() => onOptionSelect("settings")}
                />
                <OptionButton
                    text="logout"
                    onClickHandler={() => onOptionSelect("sign-out")}
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