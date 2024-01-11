import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.css";

import ProfileImage from "@/components/ProfileImage";

import acceptFriendRequest from "../../utils/acceptFriendRequest";
import declineFriendRequest from "../../utils/declineFriendRequest";

const FriendRequest = ({
    username,
    imageSrc,
    imageAlt,
    onSuccessHandler,
}) => {
    const [requesting, setRequesting] = useState("");
    const [abortController, setAbortController] = useState(null);
    const [responseMessage, setResponseMessage] = useState(null);

    useEffect(() => {
        if (abortController) abortController.abort;
        if (requesting === "accept" || requesting === "decline") {
            const abortControllerNew = new AbortController();
            setAbortController(abortControllerNew);
            (async () => {
                let response = { status: 400 };
                if (requesting === "accept") {
                    response = await acceptFriendRequest(
                        username, abortControllerNew
                    );
                    if (response.status < 400) {
                        setResponseMessage("Friend request accepted.");
                        onSuccessHandler();
                    }
                }
                if (requesting === "decline") {
                    response = await declineFriendRequest(
                        username, abortControllerNew
                    );
                    if (response.status < 400) {
                        setResponseMessage("Friend request declined.");
                        onSuccessHandler();
                    }
                }
                setRequesting("");
            })();
        }
        return () => {
            if (abortController) abortController.abort;
        }
    }, [requesting]);

    return (
        <div
            className={styles["container"]}
            aria-label="friend-request"
            tabIndex={0}
            onClick={(e) => {
                e.currentTarget.blur();
                e.preventDefault();
            }}
            onMouseLeave={(e) => {
                e.currentTarget.blur();
            }}
        >   
            {(requesting !== "accept" && requesting !== "decline")
            ?   <>
                {!responseMessage
                ?   <>
                    <div className={styles["profile-image"]}>
                        <ProfileImage
                            src={imageSrc}
                            alt={imageAlt}
                            sizePx={50}
                        />
                    </div>
                    <div className={styles["friend-request-right-side-content"]}>
                        <p
                            className={styles["friend-request-username"]}
                            aria-label="friend-request-username"
                        >{username}</p>
                        <div className={styles["friend-request-options"]}>
                            <button
                                className={styles["accept-friend-request-button"]}
                                aria-label="accept-friend-request-button"
                                onClick={(e) => {
                                    setRequesting("accept");
                                    e.currentTarget.blur();
                                    e.preventDefault();
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.blur();
                                }}
                            >Accept</button>
                            <button
                                className={styles["decline-friend-request-button"]}
                                aria-label="decline-friend-request-button"
                                onClick={(e) => {
                                    setRequesting("decline");
                                    e.currentTarget.blur();
                                    e.preventDefault();
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.blur();
                                }}
                            >Decline</button>
                        </div>
                    </div>
                    </>
                :   <p
                        className={styles["response-message"]}
                        aria-label="response-message"
                    >{responseMessage}</p>
                }
                </>
            :   <div className={styles["waiting-wheel-container"]}>
                    <div
                        className={styles["waiting-wheel"]}
                        aria-label="attempting-login"
                    ></div>
                </div>
            }
        </div>
    );
};

FriendRequest.propTypes = {
    username: PropTypes.string.isRequired,
    imageSrc: PropTypes.string,
    imageAlt: PropTypes.string,
    onSuccessHandler: PropTypes.func,
};

FriendRequest.defaultProps = {
    imageSrc: "",
    imageAlt: "",
    onSuccessHandler: () => {}
}

export default FriendRequest;