import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.css";

import ProfileImage from "@/components/ProfileImage";
import OptionButton from "@/components/OptionButton";
import Friend from "./components/Friend";
import FriendRequest from "./components/FriendRequest";
import AddFriendPanel from "./components/AddFriendPanel";

import getFriendsList from "@/utils/getFriendsList.js";
import getFriendRequests from "./utils/getFriendRequests.js";
import * as extractImage from "@/utils/extractImage";

const FriendsPanel = ({
    defaultList,
    addingFriendDefault,
    userId,
}) => {
    const [toggling, setToggling] = useState(false);
    const [toggledPanel, setToggledPanel] = useState("left");
    const [listViewing, setListViewing] = useState(defaultList);
    const [friendsList, setFriendsList] = useState({
        currentValue: [],
        abortController: new AbortController(),
        attempting: false,
        appending: false,
    });
    const [friendRequests, setFriendRequests] = useState({
        currentValue: [],
        abortController: new AbortController(),
        attempting: false,
        appending: false,
    });
    const [addingFriend, setAddingFriend] = useState(addingFriendDefault);

    const containerRef = useRef(null);

    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            if(!toggling && entries[0].contentRect.width < 540) {
                setToggling(true);
                if (toggledPanel === "right" && !addingFriend) setAddingFriend(true);
            }
            if(toggling && entries[0].contentRect.width >= 540) {
                setToggling(false);
            }
        })
        observer.observe(containerRef.current)
        return () => containerRef.current && observer.unobserve(containerRef.current)
    }, [toggling]);

    useEffect(() => {
        if (friendsList.abortController) friendsList.abortController.abort;
        const abortControllerNew = new AbortController();
        if (friendsList.attempting || friendsList.appending) {
            setFriendsList({
                ...friendsList,
                abortController: abortControllerNew,
            });
            (async () => {
                const response = await getFriendsList([
                    friendsList.currentValue.length,
                    friendsList.currentValue.length + 20
                ], abortControllerNew);
                setFriendsList({
                    ...friendsList,
                    currentValue: [...friendsList.currentValue, ...response.friends],
                    abortController: null,
                    attempting: false,
                    appending: false,
                });
            })();
        }

        return () => {
            if (friendsList.abortController) friendsList.abortController.abort;
        }
    }, [friendsList.attempting, friendsList.appending]);

    useEffect(() => {
        if (friendRequests.abortController) friendRequests.abortController.abort;
        const abortControllerNew = new AbortController();
        if (friendRequests.attempting || friendRequests.appending) {
            setFriendRequests({
                ...friendRequests,
                abortController: abortControllerNew,
            });
            (async () => {
                const response = await getFriendRequests([
                    friendRequests.currentValue.length,
                    friendRequests.currentValue.length + 20
                ], abortControllerNew);
                setFriendRequests({
                    ...friendRequests,
                    currentValue: [...friendRequests.currentValue, ...response.friendRequests],
                    abortController: null,
                    attempting: false,
                    appending: false,
                });
            })();
        }

        return () => {
            if (friendRequests.abortController) friendRequests.abortController.abort;
        }
    }, [friendRequests.attempting, friendRequests.appending]);

    useEffect(() => {
        switch (listViewing) {
            case "requests":
                setFriendRequests({
                    ...friendRequests,
                    currentValue: [],
                    attempting: true,
                    page: 1,
                });
                break;
            case "friends":
            default:
                setFriendsList({
                    ...friendsList,
                    currentValue: [],
                    attempting: true,
                    page: 1,
                });
        }
    }, [listViewing]);

    let title, optionsList;
    switch(listViewing) {
        case "requests":
            title = "Friend Requests";
            optionsList = (
                <div className={styles["scrollable-wrapper"]}>
                    <ul
                        className={styles["friend-requests-list"]}
                        aria-label="friend-requests-list"
                        key={"friend-requests-list"}
                    >
                        {friendRequests.currentValue.map((request) => {
                            return (
                                <li
                                    aria-label="friend-request"
                                    key={request._id}
                                ><FriendRequest
                                    username={request.username}
                                    profileImage={extractImage.fromUser(request).image}
                                    onSuccessHandler={() => {
                                        const reducedFriendRequests =
                                            friendRequests.currentValue.filter((friend) => {
                                                return friend._id !== request._id
                                            });
                                        setFriendRequests({
                                            ...friendRequests,
                                            currentValue: reducedFriendRequests,
                                        });
                                    }}
                                /></li>
                            );
                        })}
                        <button
                            className={styles["load-more-button"]}
                            aria-label="load-more"
                            onClick={(e) => {
                                if (!friendRequests.appending) {
                                    setFriendRequests({
                                        ...friendRequests,
                                        appending: true,
                                    });
                                }
                                e.currentTarget.blur();
                                e.preventDefault();
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.blur();
                            }}
                        >{!friendRequests.appending
                        ?   "Load More"
                        :   <div className={styles["load-more-button-waiting-wheel-container"]}>
                                <div
                                    className={styles["load-more-button-waiting-wheel"]}
                                    aria-label="waiting"
                                ></div>
                            </div>
                        }</button>
                    </ul>
                </div>
            );
            break;
        case "friends":
        default:
            title = "Friends";
            optionsList = (
                <div className={styles["scrollable-wrapper"]}>
                    <ul
                        className={styles["friends-list"]}
                        aria-label="friends-list"
                        key={"friends-list"}
                    >
                        {friendsList.currentValue.map((friend) => {
                            return (
                                <li
                                    aria-label="friend"
                                    key={friend.user._id}
                                ><Friend
                                    username={
                                        friend.user.preferences.displayName.length > 0 ?
                                        friend.user.preferences.displayName :
                                        friend.user.username
                                    }
                                    tagLine={friend.user.preferences.tagLine}
                                    status={friend.user.status}
                                    profileImage={extractImage.fromUser(friend.user).image}
                                    onClickHandler={() => {}}
                                /></li>
                            );
                        })}
                        <button
                            className={styles["load-more-button"]}
                            aria-label="load-more"
                            onClick={(e) => {
                                if (!friendsList.appending) {
                                    setFriendsList({
                                        ...friendsList,
                                        appending: true,
                                    });
                                }
                                e.currentTarget.blur();
                                e.preventDefault();
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.blur();
                            }}
                        >{!friendsList.appending
                        ?   "Load More"
                        :   <div className={styles["load-more-button-waiting-wheel-container"]}>
                                <div
                                    className={styles["load-more-button-waiting-wheel"]}
                                    aria-label="waiting"
                                ></div>
                            </div>
                        }</button>
                    </ul>
                </div>
            );
            break;
    }

    const leftSideContent = (
        <div className={styles["friends-panel"]}>
            <h3
                className={styles["friends-panel-title"]}
                aria-label="friends-panel-title"
            >{title}</h3>
            <ul
                className={styles["friends-panel-options"]}
                aria-label="friends-panel-options"
            >
                <li
                    className={styles["add-friend-button"]}
                    key="add-friend-button"
                >
                    <OptionButton
                        text="person_add"
                        label="add-friend-button"
                        tooltipText="Add Friend"
                        tooltipPosition="bottom"
                        widthPx={50}
                        heightPx={50}
                        fontSizePx={24}
                        borderType="circular"
                        onClickHandler={() => {
                            setAddingFriend(!addingFriend);
                            if (toggling) setToggledPanel("right");
                        }}
                    />
                </li>
                <li
                    className={styles["list-viewing-button"]}
                    key="list-viewing-button"
                >
                    <OptionButton
                        text={listViewing === "friends" ?
                            "people" :
                            "how_to_reg"
                        }
                        label="list-viewing-button"
                        tooltipText={listViewing === "friends" ?
                            "View Friend Requests" :
                            "View Friends"
                        }
                        tooltipPosition="bottom"
                        widthPx={50}
                        heightPx={50}
                        fontSizePx={24}
                        borderType="circular"
                        onClickHandler={() => {
                            setListViewing(
                                listViewing === "friends" ?
                                    "requests" :
                                    "friends"
                            );
                        }}
                    />
                </li>
            </ul>
            {!friendsList.attempting && !friendRequests.attempting
            ?   optionsList
            :   <div className={styles["waiting-wheel-container"]}>
                    <div
                        className={styles["waiting-wheel"]}
                        aria-label="attempting-create-account"
                    ></div>
                </div>
            }
        </div>
    );

    const rightSideContent = (
        <div className={styles["right-side-content"]}>
            {
            addingFriend ?
                <AddFriendPanel
                    onCloseHandler={() => {
                        if (toggling) setToggledPanel(toggledPanel === "left" ? "right" : "left");
                        setAddingFriend(false);
                    }}
                    onSuccessHandler={(username) => {
                        const reducedFriendRequestsArray =
                            friendRequests.currentValue.filter((friend) => {
                                return friend.username !== username
                            });
                        setFriendRequests({
                            ...friendRequests,
                            currentValue: reducedFriendRequestsArray
                        });
                    }}
                /> :
                null
            }
        </div>
    );

    let allContent = null;
    if (toggling) {
        if (toggledPanel === "left") allContent = leftSideContent;
        if (toggledPanel === "right") allContent = rightSideContent;
    } else {
        allContent = (
            <>
            {leftSideContent}
            {rightSideContent}
            </>
        );
    }

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]} ref={containerRef}>
            {allContent}
        </div>
        </div>
    );
};

FriendsPanel.propTypes = {
    defaultList: PropTypes.oneOf(["friends", "requests"]),
    addingFriendDefault: PropTypes.bool,
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

FriendsPanel.defaultProps = {
    defaultList: "friends",
    addingFriendDefault: false,
    userId: null,
}

export default FriendsPanel;