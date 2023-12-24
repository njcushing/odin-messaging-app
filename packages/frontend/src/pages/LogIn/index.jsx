import { useState, useCallback, useRef } from "react";
import styles from "./index.module.css";

import logInAPI from "./utils/logInAPI";
import { validateUsername, validatePassword } from "./utils/validateFields";

const LogIn = () => {
    const [usernameError, setUsernameError] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const [attemptingLogIn, setAttemptingLogIn] = useState(false);
    const [credentials, setCredentials] = useState({});
    const [logInError, setLogInError] = useState(null);

    const usernameInputRef = useRef(null);
    const passwordInputRef = useRef(null);

    const attemptLogIn = useCallback(async (e) => {
        const formData = new FormData(e.target.form);
        const formFields = Object.fromEntries(formData);

        // Client-side validation
        const validUsername = validateUsername(formFields.username);
        const validPassword = validatePassword(formFields.password);
        if (!validUsername.status) setUsernameError(validUsername.message);
        if (!validPassword.status) setPasswordError(validPassword.message);

        if (!validUsername.status || !validPassword.status) return;

        setAttemptingLogIn(true);
        setCredentials(formFields);
    }, []);

    if (attemptingLogIn) {
        (async () => {
            const logInResponse = await logInAPI(credentials);
            if (logInResponse.status >= 400) {
                setLogInError(logInResponse.message);
            } else {
                // redirect to dashboard
            }
            setAttemptingLogIn(false);
            setCredentials({});
        })();
    }

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <div className={styles["box"]}>
                {!attemptingLogIn
                ?   <>
                    <h1
                        className={styles["title"]}
                        aria-label="log-in-panel"
                    >Please Log in</h1>
                    <form
                        className={styles["log-in-form"]}
                        aria-label="log-in-form"
                    >
                        <label className={styles["username-label"]}
                        >Username:
                            <input
                                className={styles[`username-input${usernameError !== null ? "-error" : ""}`]}
                                aria-label="username-input"
                                id="username"
                                name="username"
                                required
                                style={{ resize: "none" }}
                                onChange={(e) => {
                                    const validUsername = validateUsername(e.target.value);
                                    if (!validUsername.status) {
                                        setUsernameError(validUsername.message);
                                    } else {
                                        setUsernameError(null);
                                    }
                                }}
                                ref={usernameInputRef}
                            ></input>
                            {usernameError !== null
                            ?   <h3
                                    className={styles["error"]}
                                    aria-label="username-error"
                                >{usernameError}</h3>
                            :   null}
                        </label>
                        <label className={styles["password-label"]}
                        >Password:
                            <input
                                className={styles[`password-input${passwordError !== null ? "-error" : ""}`]}
                                aria-label="password-input"
                                type="password"
                                id="password"
                                name="password"
                                required
                                style={{ resize: "none" }}
                                onChange={(e) => {
                                    const validPassword = validatePassword(e.target.value);
                                    if (!validPassword.status) {
                                        setPasswordError(validPassword.message);
                                    } else {
                                        setPasswordError(null);
                                    }
                                }}
                                ref={passwordInputRef}
                            ></input>
                            {passwordError !== null
                            ?   <h3
                                    className={styles["error"]}
                                    aria-label="password-error"
                                >{passwordError}</h3>
                            :   null}
                        </label>
                        <button
                            className={styles["log-in-button"]}
                            aria-label="log-in-button"
                            onClick={(e) => {
                                attemptLogIn(e);
                                e.currentTarget.blur();
                                e.preventDefault();
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.blur();
                            }}
                        >Log In</button>
                    </form>
                    {logInError !== null
                    ?   <h3
                            className={styles["log-in-error"]}
                            aria-label="log-in-error"
                        >{logInError}</h3>
                    :   null}
                    <div className={styles["create-account-container"]}>
                        <h2
                            className={styles["create-account-message"]}
                            aria-label="create-account-message"
                        >Or, if you do not yet have an account, create a free account
                        by clicking the button below</h2>
                        <button
                            className={styles["create-account-button"]}
                            aria-label="create-account-button"
                            onClick={(e) => {
                                window.location.href = "/create-account"
                                e.currentTarget.blur();
                                e.preventDefault();
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.blur();
                            }}
                        >Create Account</button>
                    </div>
                    </>
                :   <div className={styles["waiting-wheel-container"]}>
                        <div
                            className={styles["waiting-wheel"]}
                            aria-label="attempting-login"
                        ></div>
                    </div>
                }
            </div>
        </div>
        </div>
    );
};

export default LogIn;