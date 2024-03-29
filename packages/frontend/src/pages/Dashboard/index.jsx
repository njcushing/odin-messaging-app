import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.css";
import { setTheme } from "@/themes";

import OptionsSidebar from "@/features/OptionsSidebar";
import FriendsPanel from "@/features/FriendsPanel";
import ChatsPanel from "@/features/ChatsPanel";
import AccountInformation from "@/features/AccountInformation";
import Settings from "@/features/Settings";

import getSelf from "@/utils/getSelf.js";

const Dashboard = ({
    defaultOption,
}) => {
    const [userInfo, setUserInfo] = useState({
        currentValue: null,
        abortController: new AbortController(),
        attempting: true,
    })
    const [optionSelected, setOptionSelected] = useState(defaultOption);

    useEffect(() => {
        if (userInfo.abortController) userInfo.abortController.abort;
        if (userInfo.attempting) {
            const abortControllerNew = new AbortController();
            setUserInfo({
                ...userInfo,
                abortController: abortControllerNew,
            });
            (async () => {
                const response = await getSelf(abortControllerNew);
                setUserInfo({
                    ...userInfo,
                    currentValue: response.user,
                    abortController: null,
                    attempting: false,
                });
                setTheme(response.user.preferences.theme);
            })();
        } else {
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
                    userId={userInfo.currentValue ? userInfo.currentValue._id : null}
                />
            )
            break;
        case "chats":
            mainDashboardContent = (
                <ChatsPanel
                    userId={userInfo.currentValue ? userInfo.currentValue._id : null}
                />
            )
            break;
        case "account":
            mainDashboardContent = (
                <AccountInformation
                    userInfo={(() => {
                        try {
                            return {
                                displayName: userInfo.currentValue.preferences.displayName,
                                tagLine: userInfo.currentValue.preferences.tagLine,
                                status: userInfo.currentValue.preferences.setStatus,
                                profileImage: userInfo.currentValue.preferences.profileImage.img.data.data,
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
                                theme: userInfo.currentValue.preferences.theme,
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
    }

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            {!userInfo.attempting
            ?   <>
                <div className={styles["options-sidebar"]}>
                    <OptionsSidebar
                        onOptionSelect={(option) => setOptionSelected(option)}
                    />
                </div>
                <div className={styles["main-dashboard-content"]}>
                    {mainDashboardContent}
                </div>
                </>
            :   <div className={styles["waiting-wheel-container"]}>
                    <div
                        className={styles["waiting-wheel"]}
                        aria-label="attempting-create-account"
                    ></div>
                </div>
            }
        </div>
        </div>
    )
}

Dashboard.propTypes = {
    defaultOption: PropTypes.oneOf(["friends", "chats", "account", "settings"]),
}

Dashboard.defaultProps = {
    defaultOption: "friends",
}

export default Dashboard;