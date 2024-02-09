import styles from "./index.module.css";

const Landing = () => {
    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <h1 className={styles["title"]} aria-label="title">Landing Page</h1>
        </div>
        </div>
    )
}

export default Landing;