import { useState, useEffect, useCallback, useRef } from "react"
import PropTypes from "prop-types";
import styles from "./index.module.css";

import FieldUpdater from "@/components/FieldUpdater";

import * as validateUserFields from '../../../../../utils/validateUserFields.js'
import * as updateUserFields from '../../utils/updateUserFields.js'

const AccountInformation = ({
    userInfo,
    onUpdateHandler,
}) => {
    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <div className={styles["account-information"]}>
                <h1
                    className={styles["title"]}
                    aria-label="account-information-panel"
                >Account Information</h1>
                <FieldUpdater
                    labelText="Display Name"
                    fieldName="displayName"
                    initialValue={userInfo.displayName}
                    validator={validateUserFields.displayName}
                    apiFunction={updateUserFields.displayName}
                    context={{ type: "text" }}
                    onUpdateHandler={() => onUpdateHandler()}
                />
                <FieldUpdater
                    labelText="Tag Line"
                    fieldName="tagLine"
                    initialValue={userInfo.tagLine}
                    validator={validateUserFields.tagLine}
                    apiFunction={updateUserFields.tagLine}
                    context={{ type: "text" }}
                    onUpdateHandler={() => onUpdateHandler()}
                />
                <FieldUpdater
                    labelText="Status"
                    fieldName="status"
                    initialValue={userInfo.status}
                    validator={validateUserFields.status}
                    apiFunction={updateUserFields.status}
                    context={{ type: "select", options: ["online", "away", "busy", "offline", null] }}
                    onUpdateHandler={() => onUpdateHandler()}
                />
                <FieldUpdater
                    labelText="Profile Image"
                    fieldName="profileImage"
                    initialValue={userInfo.profileImage}
                    validator={validateUserFields.profileImage}
                    apiFunction={updateUserFields.profileImage}
                    context={{ type: "image" }}
                    onUpdateHandler={() => onUpdateHandler()}
                />
            </div>
        </div>
        </div>
    );
};

AccountInformation.propTypes = {
    userInfo: PropTypes.shape({
        displayName: PropTypes.string,
        tagLine: PropTypes.string,
        status: PropTypes.oneOf(["online", "away", "busy", "offline", null]),
        profileImage: PropTypes.any,
    }),
    onUpdateHandler: PropTypes.func,
}

AccountInformation.defaultProps = {
    userInfo: {
        displayName: "",
        tagLine: "",
        status: null,
        profileImage: null,
    },
    onUpdateHandler: () => {},
}

export default AccountInformation;