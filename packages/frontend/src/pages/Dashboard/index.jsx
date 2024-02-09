import { useState, useEffect } from "react";
import styles from "./index.module.css";

import OptionsSidebar from "@/features/OptionsSidebar";
import ChatSelectionPanel from "@/features/ChatSelectionPanel";

const Dashboard = () => {
    const [optionSelected, setOptionSelected] = useState("friends");

    let mainDashboardContent = null;
    switch (optionSelected) {
        case "friends":
        case "groups":
        case "communities":
            mainDashboardContent = (
                <>
                <div className={styles["main-content-panel"]}>
                    <ChatSelectionPanel
                        chatType={optionSelected}
                    />
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