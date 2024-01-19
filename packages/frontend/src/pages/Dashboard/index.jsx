import { useState, useEffect } from "react";
import styles from "./index.module.css";

import OptionsSidebar from "@/features/OptionsSidebar";
import FriendsPanel from "@/features/FriendsPanel";
import ChatsPanel from "@/features/ChatsPanel";
import AccountInformation from "@/features/AccountInformation";

import getSelf from "@/utils/getSelf.js";

const Dashboard = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [getUserInfoAC, setGetUserInfoAC] = useState(null);
    const [optionSelected, setOptionSelected] = useState("friends");

    useEffect(() => {
        if (getUserInfoAC) getUserInfoAC.abort;
        const getUserInfoACNew = new AbortController();
        setGetUserInfoAC(getUserInfoACNew);
        (async () => {
            const response = await getSelf(getUserInfoACNew);
            if (!response.user) window.location.href = "/log-in";
            setUserInfo(response.user);
            setGetUserInfoAC(null);
        })();

        return () => {
            if (getUserInfoAC) getUserInfoAC.abort;
        }
    }, []);

    let mainDashboardContent = null;
    switch (optionSelected) {
        case "friends":
            mainDashboardContent = (
                <FriendsPanel
                    userId={userInfo ? userInfo._id : null}
                />
            )
            break;
        case "chats":
            mainDashboardContent = (
                <ChatsPanel
                    userId={userInfo ? userInfo._id : null}
                />
            )
            break;
        case "account":
            mainDashboardContent = (
                <AccountInformation />
            )
            break;
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