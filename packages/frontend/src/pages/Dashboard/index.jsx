import { useState, useEffect } from "react";
import styles from "./index.module.css";

import OptionsSidebar from "@/features/OptionsSidebar";
import ChatSelectionPanel from "@/features/ChatSelectionPanel";
import ChatPanel from "@/features/ChatPanel";

const Dashboard = () => {
    const [optionSelected, setOptionSelected] = useState("friends");

    let mainDashboardContent = null;
    switch (optionSelected) {
        case "friends":
        case "groups":
        case "communities":
            mainDashboardContent = (
                <>
                <div className={styles["chat-selection-panel"]}>
                    <ChatSelectionPanel
                        chatType={optionSelected}
                    />
                </div>
                <div className={styles["chat-panel"]}>
                    <ChatPanel />
                </div>
                </>
            );
            break;
        default:
            mainDashboardContent = null;
    }

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <div className={styles["options-sidebar"]}>
                <OptionsSidebar
                    onOptionSelect={(option) => setOptionSelected(option)}
                />
            </div>
            {mainDashboardContent}
        </div>
        </div>
    )
}

export default Dashboard;