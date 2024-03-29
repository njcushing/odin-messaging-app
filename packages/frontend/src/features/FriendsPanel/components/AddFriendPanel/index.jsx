import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.css";

import OptionButton from "@/components/OptionButton";
import ProfileImage from "@/components/ProfileImage";

import getFriendCanBeAdded from "./utils/getFriendCanBeAdded.js";
import addFriend from "./utils/addFriend";
import * as extractImage from "@/utils/extractImage";
import * as validateUser from "../../../../../../../utils/validateUserFields.js";

const AddFriendPanel = ({
    onCloseHandler,
    onSuccessHandler,
}) => {
    const [searchUsername, setSearchUsername] = useState("");
    const [abortController, setAbortController] = useState(new AbortController());
    const [resultFound, setResultFound] = useState(null);
    const [responseMessage, setResponseMessage] = useState(null);
    const [addingFriend, setAddingFriend] = useState(false);

    useEffect(() => {
        if (abortController) abortController.abort;
        if (searchUsername.length > 0) {
            const abortControllerNew = new AbortController();
            setAbortController(abortControllerNew);

            const validUsername = validateUser.username(searchUsername);
            if (validUsername.status) {
                (async () => {
                    const response = await getFriendCanBeAdded(searchUsername, abortControllerNew);
                    setResultFound(response.friend);
                    if (response.status >= 400) {
                        setResponseMessage(response.message);
                    } else {
                        setResponseMessage(null);
                    }
                })();
            } else {
                setResponseMessage(validUsername.message.front);
            }
        }
        return () => {
            if (abortController) abortController.abort;
        }
    }, [searchUsername]);

    useEffect(() => {
        if (addingFriend) {
            (async () => {
                const response = await addFriend(searchUsername);
                if (response.status < 400) {
                    onSuccessHandler(searchUsername);
                    setResultFound(null);
                }
                setResponseMessage(response.message);
                setAddingFriend(false);
            })();
        }
    }, [addingFriend]);

    const profileImage = extractImage.fromUser(resultFound).image;

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <div className={styles["box"]}>
                {!addingFriend
                ?   <>
                    <h4
                        className={styles["title"]}
                        aria-label="add-friend-panel"
                    >Add a New Friend</h4>
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
                    <div className={styles["box-content"]}>
                        <div className={styles["find-friend-container"]}>
                            <label
                                className={styles["friend-name-label"]}
                                htmlFor="friend-name"
                            >Name: </label>
                            <input
                                className={styles["friend-name-input"]}
                                aria-label="friend-name-input"
                                id="friend-name"
                                name="friendName"
                                required
                                defaultValue={searchUsername}
                                style={{
                                    resize: "none"
                                }}
                                onChange={(e) => setSearchUsername(e.target.value)}
                            ></input>
                        </div>
                        <div className={styles["result-found-container"]}>
                            {resultFound !== null
                            ?   <div
                                    className={styles["result-found"]}
                                    aria-label="result-found"
                                >
                                    <div className={styles["profile-image"]}>
                                        <ProfileImage
                                            src={profileImage.src}
                                            alt={profileImage.alt}
                                            status={null}
                                            sizePx={60}
                                        />
                                    </div>
                                    <p
                                        className={styles["result-found-name"]}
                                        aria-label="result-found-name"
                                    >{resultFound.username}</p>
                                    <button
                                        className={styles["add-friend-button"]}
                                        aria-label="add-friend-button"
                                        onClick={(e) => {
                                            setAddingFriend(true);
                                            e.currentTarget.blur();
                                            e.preventDefault();
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.blur();
                                        }}
                                    >Add Friend</button>
                                </div>
                            :   <>
                                {responseMessage
                                ?   <h5
                                        className={styles["response-message"]}
                                        aria-label="response-message"
                                    >{responseMessage}</h5>
                                :   <h5
                                        className={styles["no-result-found"]}
                                        aria-label="no-result-found"
                                    >No result found.</h5>
                                }
                                </>
                            }
                        </div>
                    </div>
                    </>
                :   <div className={styles["waiting-wheel-container"]}>
                        <div
                            className={styles["waiting-wheel"]}
                            aria-label="attempting-add-friend"
                        ></div>
                    </div>
                }
            </div>
        </div>
        </div>
    );
};

AddFriendPanel.propTypes = {
    onCloseHandler: PropTypes.func,
    onSuccessHandler: PropTypes.func,
}

AddFriendPanel.defaultProps = {
    onCloseHandler: () => {},
    onSuccessHandler: () => {},
}

export default AddFriendPanel;