import { useState, useEffect, useCallback, useRef } from "react"
import PropTypes from "prop-types";
import styles from "./index.module.css";

import FieldUpdater from "@/components/FieldUpdater";

import * as themes from "@/themes";
import * as validateUserFields from '../../../../../utils/validateUserFields.js'
import * as updateUserFields from '../../utils/updateUserFields.js'

const Settings = ({
    userSettings,
    onUpdateHandler,
}) => {
    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <div className={styles["settings"]}>
                <h1
                    className={styles["title"]}
                    aria-label="settings-panel"
                >Settings</h1>
                <div className={styles["settings-container"]}>
                    <FieldUpdater
                        labelText="Theme"
                        fieldName="theme"
                        initialValue={userSettings.theme}
                        validator={validateUserFields.theme}
                        apiFunction={updateUserFields.theme}
                        context={{
                            type: "circles",
                            options: themes.options().map((theme) => {
                                return {
                                    name: theme.name,
                                    colour: theme.colour,
                                    tooltipText: theme.name,
                                    tooltipPosition: "bottom",
                                }
                            }),
                            widthPx: 64,
                            heightPx: 64,
                        }}
                        onUpdateHandler={() => onUpdateHandler()}
                    />
                </div>
            </div>
        </div>
        </div>
    );
};

Settings.propTypes = {
    userSettings: PropTypes.shape({
        theme: PropTypes.oneOf(["default", "red", "orange", "green", "blue", "purple", "light", "dark"]),
    }),
    onUpdateHandler: PropTypes.func,
}

Settings.defaultProps = {
    userSettings: {
        theme: "default",
    },
    onUpdateHandler: () => {},
}

export default Settings;