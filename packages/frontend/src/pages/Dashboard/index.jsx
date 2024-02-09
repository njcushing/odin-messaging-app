import { useState, useEffect } from "react";
import styles from "./index.module.css";

import OptionsSidebar from "@/features/OptionsSidebar";
import FriendsPanel from "@/features/FriendsPanel";
import ChatsPanel from "@/features/ChatsPanel";

const Dashboard = () => {
    const [optionSelected, setOptionSelected] = useState("friends");

    let mainDashboardContent = null;
    switch (optionSelected) {
        case "friends":
            mainDashboardContent = (
                <FriendsPanel />
            )
            break;
        case "chats":
            mainDashboardContent = (
                <ChatsPanel />
            )
            break;
        case "account":
        case "settings":
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