import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.css";

import OptionButton from "@/components/OptionButton";
import Friend from "./components/Friend";
import FriendRequest from "./components/FriendRequest";
import AddFriendPanel from "./components/AddFriendPanel";

import getFriendsList from "./utils/getFriendsList.js";
import getFriendRequests from "./utils/getFriendRequests.js";

const FriendsPanel = ({
    defaultList,
    addingFriendDefault,
}) => {
    const [listViewing, setListViewing] = useState(defaultList);
    const [friendsList, setFriendsList] = useState([]);
    const [friendsListAC, setFriendsListAC] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [friendRequestsAC, setFriendRequestsAC] = useState([]);
    const [addingFriend, setAddingFriend] = useState(addingFriendDefault);

    useEffect(() => {
        if (friendsListAC) friendsListAC.abort;
        if (friendRequestsAC) friendRequestsAC.abort;

        switch (listViewing) {
            case "friends":
                const friendsListACNew = new AbortController();
                setFriendsListAC(friendsListACNew);
                (async () => {
                    const response = await getFriendsList(friendsListACNew);
                    setFriendsList(response.friends);
                })();
                setFriendRequestsAC(null);
                break;
            case "requests":
                const friendRequestsACNew = new AbortController();
                setFriendRequestsAC(friendRequestsACNew);
                (async () => {
                    const friendRequestsNew = await getFriendRequests(friendRequestsACNew);
                    setFriendRequests(friendRequestsNew.friendRequests);
                })();
                setFriendsListAC(null);
                break;
            default:
                setFriendsListAC(null);
                setFriendRequestsAC(null);
        }
        return () => {
            if (friendsListAC) friendsListAC.abort;
            if (friendRequestsAC) friendRequestsAC.abort;
        }
    }, [listViewing]);

    let title, optionsList;
    switch(listViewing) {
        case "friends":
            title = "Friends";
            optionsList = (
                <ul
                    className={styles["friends-list"]}
                    aria-label="friends-list"
                    key={"friends-list"}
                >
                    {friendsList.map((friend) => {
                        return (
                            <li
                                aria-label="friend"
                                key={friend._id}
                            ><Friend
                                username={friend.username}
                                tagLine={friend.tagLine}
                                status={friend.status}
                                imageSrc={friend.imageSrc}
                                imageAlt={friend.imageAlt}
                                onClickHandler={() => {}}
                            /></li>
                        );
                    })}
                </ul>
            );
            break;
        case "requests":
            title = "Friend Requests";
            optionsList = (
                <ul
                    className={styles["friend-requests-list"]}
                    aria-label="friend-requests-list"
                    key={"friend-requests-list"}
                >
                    {friendRequests.map((request) => {
                        return (
                            <li
                                aria-label="friend-request"
                                key={request._id}
                            ><FriendRequest
                                username={request.username}
                                imageSrc={""}
                                imageAlt={""}
                                onSuccessHandler={() => {
                                    const reducedFriendRequests =
                                        friendRequests.filter((friend) => {
                                            return friend._id !== request._id
                                        });
                                    setFriendRequests(reducedFriendRequests);
                                }}
                            /></li>
                        );
                    })}
                </ul>
            );
            break;
        default:
            optionsList = null;
            break;
    }

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
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
                        aria-label="add-friend-button"
                        key="add-friend-button"
                    >
                        <OptionButton
                            text="person_add"
                            tooltipText="Add Friend"
                            tooltipPosition="bottom"
                            widthPx={50}
                            heightPx={50}
                            fontSizePx={24}
                            borderStyle="circular"
                            onClickHandler={() => {
                                setAddingFriend(!addingFriend);
                            }}
                        />
                    </li>
                    <li
                        className={styles["list-viewing-button"]}
                        aria-label="list-viewing-button"
                        key="list-viewing-button"
                    >
                        <OptionButton
                            text={listViewing === "friends" ?
                                "people" :
                                "how_to_reg"
                            }
                            tooltipText={listViewing === "friends" ?
                                "View Friend Requests" :
                                "View Friends"
                            }
                            tooltipPosition="bottom"
                            widthPx={50}
                            heightPx={50}
                            fontSizePx={24}
                            borderStyle="circular"
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
                {optionsList}
            </div>
            {addingFriend
            ?   <AddFriendPanel
                    onCloseHandler={() => setAddingFriend(false)}
                    onSuccessHandler={(username) => {
                        const reducedFriendRequestsArray =
                            friendRequests.filter((friend) => {
                                return friend.username !== username
                            });
                        setFriendRequests(reducedFriendRequestsArray);
                    }}
                />
            :   null}
        </div>
        </div>
    );
};

FriendsPanel.propTypes = {
    defaultList: PropTypes.oneOf(["friends", "requests"]),
    addingFriendDefault: PropTypes.bool,
}

FriendsPanel.defaultProps = {
    defaultList: "friends",
    addingFriendDefault: false,
}

export default FriendsPanel;