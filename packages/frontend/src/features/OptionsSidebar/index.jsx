import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.css";

import OptionButton from "@/components/OptionButton";

const OptionsSidebar = ({
    onOptionSelect,
}) => {
    const [orientation, setOrientation] = useState("right");
    const containerRef = useRef(null);

    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            if(entries[0].contentRect.width > 80) {
                setOrientation("horizontal");
            }
            if(entries[0].contentRect.width <= 80) {
                setOrientation("vertical");
            }
        })
        observer.observe(containerRef.current)
        return () => containerRef.current && observer.unobserve(containerRef.current)
    }, []);

    const tooltipPosition = orientation === "vertical" ? "right" : "top";

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]} ref={containerRef}>
            <div className={styles["chat-options"]}>
                <OptionButton
                    text="mood"
                    tooltipText="Friends"
                    tooltipPosition={tooltipPosition}
                    onClickHandler={() => onOptionSelect("friends")}
                    widthPx={48}
                    heightPx={48}
                    fontSizePx={34}
                />
                <OptionButton
                    text="chat"
                    tooltipText="Chats"
                    tooltipPosition={tooltipPosition}
                    onClickHandler={() => onOptionSelect("chats")}
                    widthPx={48}
                    heightPx={48}
                    fontSizePx={34}
                />
            </div>
            <div className={styles["settings-options"]}>
                <OptionButton
                    text="person"
                    tooltipText="Account Information"
                    tooltipPosition={tooltipPosition}
                    onClickHandler={() => onOptionSelect("account")}
                    widthPx={48}
                    heightPx={48}
                    fontSizePx={34}
                />
                <OptionButton
                    text="settings"
                    tooltipText="Settings"
                    tooltipPosition={tooltipPosition}
                    onClickHandler={() => onOptionSelect("settings")}
                    widthPx={48}
                    heightPx={48}
                    fontSizePx={34}
                />
                <OptionButton
                    text="logout"
                    tooltipText="Log Out"
                    tooltipPosition={tooltipPosition}
                    onClickHandler={() => {
                        localStorage.removeItem("odin-messaging-app-auth-token");
                        window.location.href = "/log-in";
                    }}
                    widthPx={48}
                    heightPx={48}
                    fontSizePx={34}
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