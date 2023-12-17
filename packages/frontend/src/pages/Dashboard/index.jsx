import styles from "./index.module.css";

import OptionsSidebar from "@/features/OptionsSidebar";
import ChatSelectionPanel from "@/features/ChatSelectionPanel";
import ChatPanel from "@/features/ChatPanel";

const Dashboard = () => {
    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <div className={styles["options-sidebar"]}>
                <OptionsSidebar />
            </div>
            <div className={styles["chat-selection-panel"]}>
                <ChatSelectionPanel />
            </div>
            <div className={styles["chat-panel"]}>
                <ChatPanel />
            </div>
        </div>
        </div>
    )
}

export default Dashboard;