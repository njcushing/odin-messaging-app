import styles from "./index.module.css";

import NavigationButton from "@/features/NavBar/components/NavigationButton";

const ErrorPage = () => {
    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <h1 className={styles["error-message"]} aria-label="error-message">
                Uh Oh! There doesn't appear to be anything here. Please click
                the button below to return to the home page.
            </h1>
            <div className={styles["navigation-button"]}>
                <NavigationButton
                    link="/dashboard"
                    text="Go Back"
                />
            </div>
        </div>
        </div>
    )
}

export default ErrorPage;