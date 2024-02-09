import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.css";

import OptionButton from "@/components/OptionButton";
import ProfileImage from "@/components/ProfileImage";

import getFriendsList from "../../utils/getFriendsList";

const CreateGroupPanel = ({
    onCloseHandler,
    createGroupHandler,
    createGroupSubmissionErrors,
}) => {
    const [friendsList, setFriendsList] = useState([]);
    const [friendsAdding, setFriendsAdding] = useState(new Set());

    useEffect(() => {
        (async () => {
            const friendsListNew = await getFriendsList();
            setFriendsList(friendsListNew);
        })();
    }, []);

    const addToGroup = (_id) => {
        const friendsAddingNew = new Set(friendsAdding);
        friendsAddingNew.add(_id);
        setFriendsAdding(friendsAddingNew);
    };

    const removeFromGroup = (_id) => {
        const friendsAddingNew = new Set(friendsAdding);
        friendsAddingNew.delete(_id);
        setFriendsAdding(friendsAddingNew);
    }

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <div className={styles["box"]}>
                <h4
                    className={styles["title"]}
                    aria-label="create-group-panel"
                >Create a New Group</h4>
                <div className={styles["option-button"]}>
                    <OptionButton
                        text="close"
                        tooltipText="Close"
                        tooltipPosition="bottom"
                        widthPx={30}
                        heightPx={30}
                        fontSizePx={22}
                        borderStyle="rectangular"
                        onClickHandler={(e) => onCloseHandler(e)}
                    />
                </div>
                    {friendsAdding.size > 0
                    ?   <div className={styles["friends-adding-container"]}>
                            <ul
                                className={styles["friends-adding-list"]}
                                aria-label="friends-adding-list"
                            >
                                {friendsList.map((friend, i) => {
                                    if (friendsAdding.has(friend._id)) {
                                        return(
                                            <li
                                                className={styles["friend-adding"]}
                                                aria-label="friend-adding"
                                                key={friend._id}
                                            >
                                                <h5
                                                    className={styles["friend-adding-name"]}
                                                    aria-label="friend-adding-name"
                                                >{friend.name}</h5>
                                                <button
                                                    className={styles["remove-from-group-button"]}
                                                    aria-label="remove-from-group-button"
                                                    onClick={(e) => {
                                                        removeFromGroup(friend._id);
                                                        e.currentTarget.blur();
                                                        e.preventDefault();
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.blur();
                                                    }}
                                                >Remove</button>
                                            </li>
                                        );
                                    }
                                })}
                            </ul>
                        </div>
                    :   null}
                <div className={styles["friends-list-container"]}>
                    {friendsList.length > 0
                    ?   <ul
                            className={styles["friends-list"]}
                            aria-label="friends-list"
                        >
                            {friendsList.map((friend, i) => {
                                if (!friendsAdding.has(friend._id)) {
                                    return(
                                        <li
                                            className={styles["friend"]}
                                            aria-label="friend"
                                            key={friend._id}
                                        >
                                            <div className={styles["profile-image"]}>
                                                <ProfileImage
                                                    src={""}
                                                    alt={""}
                                                    sizePx={60}
                                                />
                                            </div>
                                            <h5
                                                className={styles["friend-name"]}
                                                aria-label="friend-name"
                                            >{friend.name}</h5>
                                            <button
                                                className={styles["add-to-group-button"]}
                                                aria-label="add-to-group-button"
                                                onClick={(e) => {
                                                    addToGroup(friend._id);
                                                    e.currentTarget.blur();
                                                    e.preventDefault();
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.blur();
                                                }}
                                            >Add to Group</button>
                                        </li>
                                    );
                                }
                            })}
                        </ul>
                    :   <h5
                            className={styles["no-friends"]}
                            aria-label="no-friends"
                        >You do not have any friends to create a group with</h5>
                    }
                </div>
                {friendsAdding.size > 0
                ?   <button
                        className={styles["create-group-button"]}
                        aria-label="create-group-button"
                        onClick={(e) => {
                            createGroupHandler(friendsAdding);
                            e.currentTarget.blur();
                            e.preventDefault();
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.blur();
                        }}
                    >Create Group</button>
                :   null}
                {createGroupSubmissionErrors.length > 0
                ?   <div className={styles["create-group-submission-errors"]}>
                        <h4
                            className={styles["create-group-submission-errors-title"]}
                            aria-label="create-group-submission-errors-title"
                        >Error(s):</h4>
                        <ul
                            className={styles["create-group-submission-errors-list"]}
                            aria-label="create-group-submission-errors-list"
                        >
                            {createGroupSubmissionErrors.map((error, i) => {
                                return <li
                                    className={styles["create-group-submission-error-item"]}
                                    aria-label="create-group-submission-error-item"
                                    key={i}
                                >{error}</li>
                            })}
                        </ul>
                    </div>
                :   null}
            </div>
        </div>
        </div>
    );
};

CreateGroupPanel.propTypes = {
    onCloseHandler: PropTypes.func,
    createGroupHandler: PropTypes.func,
    createGroupSubmissionErrors: PropTypes.arrayOf(PropTypes.string),
}

CreateGroupPanel.defaultProps = {
    onCloseHandler: () => {},
    createGroupHandler: () => {},
    createGroupSubmissionErrors: [],
}

export default CreateGroupPanel;