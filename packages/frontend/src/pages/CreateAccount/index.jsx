import { useState, useCallback, useRef } from "react";
import styles from "./index.module.css";

import createAccountAPI from "./utils/createAccountAPI";
import { validateUsername, validatePassword } from "./utils/validateFields";

const CreateAccount = () => {
    const [usernameError, setUsernameError] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const [confirmPasswordError, setConfirmPasswordError] = useState(null);
    const [attemptingCreateAccount, setAttemptingCreateAccount] = useState(false);
    const [credentials, setCredentials] = useState({});
    const [createAccountError, setCreateAccountError] = useState(null);

    const usernameInputRef = useRef(null);
    const passwordInputRef = useRef(null);
    const confirmPasswordInputRef = useRef(null);

    const attemptCreateAccount = useCallback(async (e) => {
        const formData = new FormData(e.target.form);
        const formFields = Object.fromEntries(formData);

        // Client-side validation
        let validCredentials = true;
        const validUsername = validateUsername(formFields.username);
        const validPassword = validatePassword(formFields.password);
        const validConfirmPassword = validatePassword(formFields.confirmPassword);
        if (!validUsername.status) {
            validCredentials = false;
            setUsernameError(validUsername.message);
        }
        if (!validPassword.status) {
            validCredentials = false;
            setPasswordError(validPassword.message);
        }
        if (!validConfirmPassword.status) {
            validCredentials = false;
            setConfirmPasswordError(validConfirmPassword.message);
        }
        if (
            validPassword.status &&
            validConfirmPassword.status &&
            formFields.password !== formFields.confirmPassword
        ) {
            validCredentials = false;
            setPasswordError("Your passwords must match.");
            setConfirmPasswordError("Your passwords must match.");
        }

        if (!validCredentials) return;

        setAttemptingCreateAccount(true);
        setCredentials(formFields);
    }, []);

    const updatePasswordErrors = () => {
        const validPassword = validatePassword(passwordInputRef.current.value);
        const validConfirmPassword = validatePassword(confirmPasswordInputRef.current.value);
        if (!validPassword.status) {
            setPasswordError(validPassword.message);
        } else {
            setPasswordError(null);
        }
        if (!validConfirmPassword.status) {
            setConfirmPasswordError(validConfirmPassword.message);
        } else {
            setConfirmPasswordError(null);
        }
        if (
            validPassword.status &&
            validConfirmPassword.status &&
            passwordInputRef.current.value !== confirmPasswordInputRef.current.value
        ) {
            setPasswordError("Your passwords must match.");
            setConfirmPasswordError("Your passwords must match.");
        }
    };

    if (attemptingCreateAccount) {
        (async () => {
            const createAccountResponse = await createAccountAPI(credentials);
            if (createAccountResponse.status >= 400) {
                setCreateAccountError(createAccountResponse.message);
            } else {
                window.location.href = "/dashboard";
            }
            setAttemptingCreateAccount(false);
            setCredentials({});
        })();
    }

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <div className={styles["box"]}>
                {!attemptingCreateAccount
                ?   <>
                    <h1
                        className={styles["title"]}
                        aria-label="create-account-panel"
                    >Please enter your details</h1>
                    <form
                        className={styles["create-account-form"]}
                        aria-label="create-account-form"
                    >
                        <h3
                            className={styles["requirement-message"]}
                            aria-label="requirement-message"
                        >Required fields are marked by an asterisk (*)</h3>
                        <label className={styles["username-label"]}
                        >Username*:
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
                        >Password*:
                            <input
                                className={styles[`password-input${passwordError !== null ? "-error" : ""}`]}
                                aria-label="password-input"
                                type="password"
                                id="password"
                                name="password"
                                required
                                style={{ resize: "none" }}
                                onChange={() => updatePasswordErrors()}
                                ref={passwordInputRef}
                            ></input>
                            {passwordError !== null
                            ?   <h3
                                    className={styles["error"]}
                                    aria-label="password-error"
                                >{passwordError}</h3>
                            :   null}
                        </label>
                        <label className={styles["confirm-password-label"]}
                        >Confirm Password*:
                            <input
                                className={styles[`confirm-password-input${confirmPasswordError !== null ? "-error" : ""}`]}
                                aria-label="confirm-password-input"
                                type="password"
                                id="confirm-password"
                                name="confirmPassword"
                                required
                                style={{ resize: "none" }}
                                onChange={() => updatePasswordErrors()}
                                ref={confirmPasswordInputRef}
                            ></input>
                            {confirmPasswordError !== null
                            ?   <h3
                                    className={styles["error"]}
                                    aria-label="confirm-password-error"
                                >{confirmPasswordError}</h3>
                            :   null}
                        </label>
                        <button
                            className={styles["create-account-button"]}
                            aria-label="create-account-button"
                            onClick={(e) => {
                                attemptCreateAccount(e);
                                e.currentTarget.blur();
                                e.preventDefault();
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.blur();
                            }}
                        >Create Account</button>
                    </form>
                    {createAccountError !== null
                    ?   <h3
                            className={styles["create-account-error"]}
                            aria-label="create-account-error"
                        >{createAccountError}</h3>
                    :   null}
                    <div className={styles["return-to-log-in-button-container"]}>
                        <button
                            className={styles["return-to-log-in-button"]}
                            aria-label="return-to-log-in"
                            onClick={(e) => {
                                window.location.href = "/log-in"
                                e.currentTarget.blur();
                                e.preventDefault();
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.blur();
                            }}
                        >Return to Log In</button>
                    </div>
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

export default CreateAccount;