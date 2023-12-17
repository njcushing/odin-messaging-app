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
                    text="Friends"
                    onClickHandler={() => onOptionSelect("friends")}
                />
                <OptionButton
                    text="Groups"
                    onClickHandler={() => onOptionSelect("groups")}
                />
                <OptionButton
                    text="Communities"
                    onClickHandler={() => onOptionSelect("communities")}
                />
            </div>
            <div className={styles["settings-options"]}>
                <OptionButton
                    text="Account"
                    onClickHandler={() => onOptionSelect("account")}
                />
                <OptionButton
                    text="Settings"
                    onClickHandler={() => onOptionSelect("settings")}
                />
                <OptionButton
                    text="Sign Out"
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