import { useState } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.css";

import OptionButton from "@/components/OptionButton";
import ProfileImage from "@/components/ProfileImage";

import findUser from "./utils/findUser";

const AddFriendModal = ({
    onCloseHandler,
    addFriendHandler,
    addFriendSubmissionErrors,
}) => {
    const [resultFound, setResultFound] = useState(null);

    const updateResult = async (inputValue) => {
        const newUser = await findUser(inputValue);
        setResultFound(newUser);
    }

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <div className={styles["box"]}>
                <h4
                    className={styles["title"]}
                    aria-label="add-friend-modal"
                >Add a New Friend</h4>
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
                        style={{
                            resize: "none"
                        }}
                        onChange={(e) => updateResult(e.target.value)}
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
                                    src={""}
                                    alt={""}
                                    sizePx={60}
                                />
                            </div>
                            <p
                                className={styles["result-found-name"]}
                                aria-label="result-found-name"
                            >{resultFound.name}</p>
                            <button
                                className={styles["add-friend-button"]}
                                aria-label="add-friend-button"
                                onClick={(e) => {
                                    addFriendHandler(e);
                                    e.currentTarget.blur();
                                    e.preventDefault();
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.blur();
                                }}
                            >Add Friend</button>
                        </div>
                    :   <h5
                            className={styles["no-result-found"]}
                            aria-label="no-result-found"
                        >No result found</h5>
                    }
                </div>
                {addFriendSubmissionErrors.length > 0
                ?   <div className={styles["add-friend-submission-errors"]}>
                        <h4
                            className={styles["add-friend-submission-errors-title"]}
                            aria-label="add-friend-submission-errors-title"
                        >Error(s):</h4>
                        <ul
                            className={styles["add-friend-submission-errors-list"]}
                            aria-label="add-friend-submission-errors-list"
                        >
                            {addFriendSubmissionErrors.map((error, i) => {
                                return <li
                                    className={styles["add-friend-submission-error-item"]}
                                    aria-label="add-friend-submission-error-item"
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

AddFriendModal.propTypes = {
    onCloseHandler: PropTypes.func,
    addFriendHandler: PropTypes.func,
    addFriendSubmissionErrors: PropTypes.arrayOf(PropTypes.string),
}

AddFriendModal.defaultProps = {
    onCloseHandler: () => {},
    addFriendHandler: () => {},
    addFriendSubmissionErrors: [],
}

export default AddFriendModal;