import { useState, useEffect } from "react";
import styles from "./index.module.css";
import { setTheme } from "@/themes";

import OptionsSidebar from "@/features/OptionsSidebar";
import FriendsPanel from "@/features/FriendsPanel";
import ChatsPanel from "@/features/ChatsPanel";
import AccountInformation from "@/features/AccountInformation";
import Settings from "@/features/Settings";

import getSelf from "@/utils/getSelf.js";

const Dashboard = () => {
    const [userInfo, setUserInfo] = useState({
        value: null,
        abortController: null,
        attempting: true,
    })
    const [optionSelected, setOptionSelected] = useState("friends");

    useEffect(() => {
        if (userInfo.attempting) {
            if (userInfo.abortController) userInfo.abortController.abort;
            const abortControllerNew = new AbortController();
            setUserInfo({
                ...userInfo,
                abortController: abortControllerNew,
            });
            (async () => {
                const response = await getSelf(abortControllerNew);
                setUserInfo({
                    ...userInfo,
                    value: response.user,
                    abortController: null,
                    attempting: false,
                });
                setTheme(response.user.preferences.theme);
            })();
        } else {
            if (userInfo.abortController) userInfo.abortController.abort;
            setUserInfo({
                ...userInfo,
                abortController: null,
            });
        }

        return () => {
            if (userInfo.abortController) userInfo.abortController.abort;
        }
    }, [userInfo.attempting]);

    let mainDashboardContent = null;
    switch (optionSelected) {
        case "friends":
            mainDashboardContent = (
                <FriendsPanel
                    userId={userInfo.value ? userInfo.value._id : null}
                />
            )
            break;
        case "chats":
            mainDashboardContent = (
                <ChatsPanel
                    userId={userInfo.value ? userInfo.value._id : null}
                />
            )
            break;
        case "account":
            mainDashboardContent = (
                <AccountInformation
                    userInfo={(() => {
                        try {
                            return {
                                displayName: userInfo.value.preferences.displayName,
                                tagLine: userInfo.value.preferences.tagLine,
                                status: userInfo.value.preferences.setStatus,
                                profileImage: userInfo.value.preferences.image,
                            }
                        } catch (error) {
                            return {
                                displayName: "",
                                tagLine: "",
                                status: null,
                                profileImage: null,
                            }
                        }
                    })()}
                    onUpdateHandler={() => {
                        if (!userInfo.attempting) {
                            setUserInfo({
                                ...userInfo,
                                attempting: true,
                            })
                        }
                    }}
                />
            )
            break;
        case "settings":
            mainDashboardContent = (
                <Settings
                    userSettings={(() => {
                        try {
                            return {
                                theme: userInfo.value.preferences.theme,
                            }
                        } catch (error) {
                            return {
                                theme: "default",
                            }
                        }
                    })()}
                    onUpdateHandler={() => {
                        if (!userInfo.attempting) {
                            setUserInfo({
                                ...userInfo,
                                attempting: true,
                            })
                        }
                    }}
                />
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