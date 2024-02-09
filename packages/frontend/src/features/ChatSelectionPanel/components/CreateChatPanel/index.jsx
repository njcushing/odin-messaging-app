import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.css";

import OptionButton from "@/components/OptionButton";
import ProfileImage from "@/components/ProfileImage";

import getFriendsList from "../../utils/getFriendsList";

const CreateChatPanel = ({
    onCloseHandler,
    createChatHandler,
    createChatSubmissionErrors,
}) => {
    const [friendsList, setFriendsList] = useState([]);

    useEffect(() => {
        (async () => {
            const friendsListNew = await getFriendsList();
            setFriendsList(friendsListNew);
        })();
    }, []);

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <div className={styles["box"]}>
                <h4
                    className={styles["title"]}
                    aria-label="create-chat-panel"
                >Create a New Chat</h4>
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
                <div className={styles["friends-list-container"]}>
                    {friendsList.length > 0
                    ?   <ul
                            className={styles["friends-list"]}
                            aria-label="friends-list"
                        >
                            {friendsList.map((friend, i) => {
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
                                        <p
                                            className={styles["friend-name"]}
                                            aria-label="friend-name"
                                        >{friend.name}</p>
                                        <button
                                            className={styles["create-chat-button"]}
                                            aria-label="create-chat-button"
                                            onClick={(e) => {
                                                createChatHandler(e);
                                                e.currentTarget.blur();
                                                e.preventDefault();
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.blur();
                                            }}
                                        >Create Chat</button>
                                    </li>
                                );
                            })}
                        </ul>
                    :   <h5
                            className={styles["no-friends"]}
                            aria-label="no-friends"
                        >You do not have any friends to create a chat with</h5>
                    }
                </div>
                {createChatSubmissionErrors.length > 0
                ?   <div className={styles["create-chat-submission-errors"]}>
                        <h4
                            className={styles["create-chat-submission-errors-title"]}
                            aria-label="create-chat-submission-errors-title"
                        >Error(s):</h4>
                        <ul
                            className={styles["create-chat-submission-errors-list"]}
                            aria-label="create-chat-submission-errors-list"
                        >
                            {createChatSubmissionErrors.map((error, i) => {
                                return <li
                                    className={styles["create-chat-submission-error-item"]}
                                    aria-label="create-chat-submission-error-item"
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

CreateChatPanel.propTypes = {
    onCloseHandler: PropTypes.func,
    createChatHandler: PropTypes.func,
    createChatSubmissionErrors: PropTypes.arrayOf(PropTypes.string),
}

CreateChatPanel.defaultProps = {
    onCloseHandler: () => {},
    createChatHandler: () => {},
    createChatSubmissionErrors: [],
}

export default CreateChatPanel;