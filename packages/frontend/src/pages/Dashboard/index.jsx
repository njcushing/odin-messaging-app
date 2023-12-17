import styles from "./index.module.css";

const Dashboard = () => {
    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <h1 className={styles["title"]} aria-label="title">Dashboard</h1>
        </div>
        </div>
    )
}

export default Dashboard;