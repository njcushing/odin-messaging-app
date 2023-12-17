import styles from "./App.module.css";

import Router from "./routes/Router.jsx";

const App = () => {
    return (
        <div className={styles["app"]}>
            <Router />
        </div>
    )
};

export default App;