import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.css";

import OptionButton from "@/components/OptionButton";
import ProfileImage from "@/components/ProfileImage";

import getFriendsList from "@/utils/getFriendsList";

const FriendSelectorPanel = ({
    title,
    removeButtonText,
    addButtonText,
    submitButtonText,
    noFriendsText,
    onCloseHandler,
    onSubmitHandler,
    submissionErrors,
}) => {
    const [friendsList, setFriendsList] = useState([]);
    const [friendsSelected, setFriendsSelected] = useState(new Set());

    useEffect(() => {
        (async () => {
            const response = await getFriendsList();
            setFriendsList(response.friends);
        })();
    }, []);

    const addToSelectedList = (_id) => {
        const friendsSelectedNew = new Set(friendsSelected);
        friendsSelectedNew.add(_id);
        setFriendsSelected(friendsSelectedNew);
    };

    const removeFromSelectedList = (_id) => {
        const friendsSelectedNew = new Set(friendsSelected);
        friendsSelectedNew.delete(_id);
        setFriendsSelected(friendsSelectedNew);
    }

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <div className={styles["box"]}>
                <h4
                    className={styles["title"]}
                    aria-label="friend-selector-panel"
                >{title}</h4>
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
                    {friendsSelected.size > 0
                    ?   <div className={styles["friends-selected-container"]}>
                            <ul
                                className={styles["friends-selected-list"]}
                                aria-label="friends-selected-list"
                            >
                                {friendsList.map((friend) => {
                                    if (friendsSelected.has(friend._id)) {
                                        return(
                                            <li
                                                className={styles["friend-selected"]}
                                                aria-label="friend-selected"
                                                key={friend._id}
                                            >
                                                <h5
                                                    className={styles["friend-selected-name"]}
                                                    aria-label="friend-selected-name"
                                                >{
                                                    friend.displayName !== "" ?
                                                    friend.displayName :
                                                    friend.username
                                                }</h5>
                                                <button
                                                    className={styles["remove-button"]}
                                                    aria-label="remove-button"
                                                    onClick={(e) => {
                                                        removeFromSelectedList(friend._id);
                                                        e.currentTarget.blur();
                                                        e.preventDefault();
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.blur();
                                                    }}
                                                >{removeButtonText}</button>
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
                            {friendsList.map((friend) => {
                                if (!friendsSelected.has(friend._id)) {
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
                                            >{
                                                friend.displayName !== "" ?
                                                friend.displayName :
                                                friend.username
                                            }</h5>
                                            <button
                                                className={styles["add-button"]}
                                                aria-label="add-button"
                                                onClick={(e) => {
                                                    addToSelectedList(friend._id);
                                                    e.currentTarget.blur();
                                                    e.preventDefault();
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.blur();
                                                }}
                                            >{addButtonText}</button>
                                        </li>
                                    );
                                }
                            })}
                        </ul>
                    :   <h5
                            className={styles["no-friends"]}
                            aria-label="no-friends"
                        >{noFriendsText}</h5>
                    }
                </div>
                {friendsSelected.size > 0
                ?   <div className={styles["submit-button-container"]}>
                        <button
                            className={styles["submit-button"]}
                            aria-label="submit-button"
                            onClick={(e) => {
                                onSubmitHandler(friendsSelected);
                                e.currentTarget.blur();
                                e.preventDefault();
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.blur();
                            }}
                        >{submitButtonText}</button>
                    </div>
                :   null}
                {submissionErrors.length > 0
                ?   <div className={styles["submission-errors"]}>
                        <h4
                            className={styles["submission-errors-title"]}
                            aria-label="submission-errors-title"
                        >Error(s):</h4>
                        <ul
                            className={styles["submission-errors-list"]}
                            aria-label="submission-errors-list"
                        >
                            {submissionErrors.map((error, i) => {
                                return <li
                                    className={styles["submission-error-item"]}
                                    aria-label="submission-error-item"
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

FriendSelectorPanel.propTypes = {
    title: PropTypes.string,
    removeButtonText: PropTypes.string,
    addButtonText: PropTypes.string,
    submitButtonText: PropTypes.string,
    noFriendsText: PropTypes.string,
    onCloseHandler: PropTypes.func,
    onSubmitHandler: PropTypes.func,
    submissionErrors: PropTypes.arrayOf(PropTypes.string),
}

FriendSelectorPanel.defaultProps = {
    title: "Title",
    removeButtonText: "Remove",
    addButtonText: "Add",
    submitButtonText: "Submit",
    noFriendsText: "No friends found.",
    onCloseHandler: () => {},
    onSubmitHandler: () => {},
    submissionErrors: [],
}

export default FriendSelectorPanel;