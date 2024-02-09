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
        default:
            mainDashboardContent = (
                <>
                <div className={styles["chat-selection-panel"]}>
                    <ChatSelectionPanel />
                </div>
                <div className={styles["chat-panel"]}>
                    <ChatPanel />
                </div>
                </>
            );
    }

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <div className={styles["options-sidebar"]}>
                <OptionsSidebar />
            </div>
            {mainDashboardContent}
        </div>
        </div>
    )
}

export default Dashboard;