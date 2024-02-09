import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.css";

import OptionButton from "@/components/OptionButton";
import ProfileImage from "@/components/ProfileImage";

import getFriendsList from "@/utils/getFriendsList";
import * as extractImage from "@/utils/extractImage";

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
    const [friendsList, setFriendsList] = useState({
        currentValue: [],
        abortController: new AbortController(),
        attempting: true,
        appending: false,
    });

    const [friendsSelected, setFriendsSelected] = useState(new Set());

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
                {!friendsList.attempting
                ?   <>
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
                            borderType="rectangular"
                            onClickHandler={(e) => onCloseHandler(e)}
                        />
                    </div>
                        {friendsSelected.size > 0
                        ?   <div className={styles["friends-selected-container"]}>
                                <ul
                                    className={styles["friends-selected-list"]}
                                    aria-label="friends-selected-list"
                                >
                                    {friendsList.currentValue.map((friend) => {
                                        const user = friend.user;
                                        if (friendsSelected.has(user._id)) {
                                            return(
                                                <li
                                                    className={styles["friend-selected"]}
                                                    aria-label="friend-selected"
                                                    key={user._id}
                                                >
                                                    <h5
                                                        className={styles["friend-selected-name"]}
                                                        aria-label="friend-selected-name"
                                                    >{
                                                        user.preferences.displayName !== "" ?
                                                        user.preferences.displayName :
                                                        user.username
                                                    }</h5>
                                                    <button
                                                        className={styles["remove-button"]}
                                                        aria-label="remove-button"
                                                        onClick={(e) => {
                                                            removeFromSelectedList(user._id);
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
                        {friendsList.currentValue.length > 0
                        ?   <ul
                                className={styles["friends-list"]}
                                aria-label="friends-list"
                            >
                                {friendsList.currentValue.map((friend) => {
                                    const user = friend.user;
                                    if (!friendsSelected.has(user._id)) {
                                        const profileImage = extractImage.fromUser(user).image;
                                        return(
                                            <li
                                                className={styles["friend"]}
                                                aria-label="friend"
                                                key={user._id}
                                            >
                                                <div className={styles["profile-image"]}>
                                                    <ProfileImage
                                                        src={profileImage.src}
                                                        alt={profileImage.alt}
                                                        status={profileImage.status}
                                                        sizePx={60}
                                                    />
                                                </div>
                                                <h5
                                                    className={styles["friend-name"]}
                                                    aria-label="friend-name"
                                                >{
                                                    user.preferences.displayName !== "" ?
                                                    user.preferences.displayName :
                                                    user.username
                                                }</h5>
                                                <button
                                                    className={styles["add-button"]}
                                                    aria-label="add-button"
                                                    onClick={(e) => {
                                                        addToSelectedList(user._id);
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
                                    key="load-more-button"
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