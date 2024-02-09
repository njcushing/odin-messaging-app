import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./index.module.css";

import createAccountAPI from "./utils/createAccountAPI";
import { username, email, password } from "../../../../../utils/validateUserFields";
import redirectUserToLogin from "@/utils/redirectUserToLogin";

const CreateAccount = () => {
    const [usernameError, setUsernameError] = useState(null);
    const [emailError, setEmailError] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const [confirmPasswordError, setConfirmPasswordError] = useState(null);
    const [attemptingCreateAccount, setAttemptingCreateAccount] = useState(false);
    const [credentials, setCredentials] = useState({});
    const [createAccountError, setCreateAccountError] = useState(null);

    const usernameInputRef = useRef(null);
    const emailInputRef = useRef(null);
    const passwordInputRef = useRef(null);
    const confirmPasswordInputRef = useRef(null);

    const attemptCreateAccount = useCallback(async (e) => {
        const formData = new FormData(e.target.form);
        const formFields = Object.fromEntries(formData);

        // Client-side validation
        let validCredentials = true;
        const validUsername = username(formFields.username);
        const validEmail = email(formFields.email);
        const validPassword = password(formFields.password);
        const validConfirmPassword = password(formFields.confirmPassword);
        if (!validUsername.status) {
            validCredentials = false;
            setUsernameError(validUsername.message.front);
        }
        if (!validEmail.status) {
            validCredentials = false;
            setEmailError(validEmail.message.front);
        }
        if (!validPassword.status) {
            validCredentials = false;
            setPasswordError(validPassword.message.front);
        }
        if (!validConfirmPassword.status) {
            validCredentials = false;
            setConfirmPasswordError(validConfirmPassword.message.front);
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
        const validPassword = password(passwordInputRef.current.value);
        const validConfirmPassword = password(confirmPasswordInputRef.current.value, true);
        if (!validPassword.status) {
            setPasswordError(validPassword.message.front);
        } else {
            setPasswordError(null);
        }
        if (!validConfirmPassword.status) {
            setConfirmPasswordError(validConfirmPassword.message.front);
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

    useEffect(() => {
        // Had to wrap this inside useEffect to prevent two API calls in StrictMode
        if (attemptingCreateAccount) {
            (async () => {
                const response = await createAccountAPI(credentials);
                if (response.status >= 400) {
                    setCreateAccountError(response.message);
                    setAttemptingCreateAccount(false);
                    setCredentials({
                        username: credentials.username,
                        email: credentials.email,
                    });
                } else {
                    window.location.href = "/dashboard";
                }
            })();
        }
    }, [attemptingCreateAccount]);

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
                                defaultValue={credentials.username ? credentials.username : ""}
                                style={{ resize: "none" }}
                                onChange={(e) => {
                                    const validUsername = username(e.target.value);
                                    if (!validUsername.status) {
                                        setUsernameError(validUsername.message.front);
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
                        <label className={styles["email-label"]}
                        >Email*:
                            <input
                                className={styles[`email-input${emailError !== null ? "-error" : ""}`]}
                                aria-label="email-input"
                                id="email"
                                name="email"
                                required
                                defaultValue={credentials.email ? credentials.email : ""}
                                style={{ resize: "none" }}
                                onChange={(e) => {
                                    const validEmail = email(e.target.value);
                                    if (!validEmail.status) {
                                        setEmailError(validEmail.message.front);
                                    } else {
                                        setEmailError(null);
                                    }
                                }}
                                ref={emailInputRef}
                            ></input>
                            {emailError !== null
                            ?   <h3
                                    className={styles["error"]}
                                    aria-label="email-error"
                                >{emailError}</h3>
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
                                redirectUserToLogin();
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