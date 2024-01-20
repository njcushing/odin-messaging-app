import { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.css";

const createInputContainer = (state, setter, labelText, updater, input) => {
    return (
        <div className={styles["field-container"]}>
        <label className={styles["label"]}
        >{labelText}:
            <div className={styles["text-input-and-button-container"]}>
                {input}
                <button
                    className={styles[`update-button${state.attemptingUpdate ? "-waiting" : ""}`]}
                    aria-label="update"
                    onClick={(e) => {
                        updater(state, setter);
                        e.currentTarget.blur();
                        e.preventDefault();
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.blur();
                    }}
                >{!state.attemptingUpdate
                ?   "Update"
                :   <div className={styles["update-button-waiting-wheel-container"]}>
                        <div
                            className={styles["update-button-waiting-wheel"]}
                            aria-label="waiting"
                        ></div>
                    </div>
                }</button>
            </div>
        </label>
        {state.error !== null
        ?   <h3
                className={styles["error"]}
                aria-label="text-input-error"
            >{state.error}</h3>
        :   null}
        </div>
    );
}

const createTextFieldUpdater = (state, setter, labelText, fieldName, updater) => {
    const input = (
        <input
            className={styles[`text-input${state.error !== null ? "-error" : ""}`]}
            id={fieldName}
            name={fieldName}
            defaultValue={state.currentValue}
            style={{ resize: "none" }}
            onChange={(e) => {
                const validValue = state.validator(e.target.value);
                setter({
                    ...state,
                    error: !validValue.status ? validValue.message.front : null,
                    currentValue: e.target.value,
                });
            }}
            disabled={state.attemptingUpdate}
            ref={state.inputRef}
        ></input>
    );
    return createInputContainer(state, setter, labelText, updater, input);
}

const createSelectFieldUpdater = (state, setter, labelText, options, fieldName, updater) => {
    const input = (
        <select
            className={styles[`select${state.error !== null ? "-error" : ""}`]}
            id={fieldName}
            name={fieldName}
            defaultValue={state.currentValue}
            style={{ resize: "none" }}
            onChange={(e) => {
                const validValue = state.validator(options[e.target.selectedIndex]);
                setter({
                    ...state,
                    error: !validValue.status ? validValue.message.front : null,
                    currentValue: options[e.target.selectedIndex],
                });
            }}
            disabled={state.attemptingUpdate}
            ref={state.inputRef}
        >
            {options.map((option) => {
                return (
                    <option
                        className={styles["select-option"]}
                        value={option}
                        key={option}
                    >{option ? option : "default"}</option>
                )
            })};
        </select>
    );
    return createInputContainer(state, setter, labelText, updater, input);
}

const FieldUpdater = ({
    labelText,
    fieldName,
    initialValue,
    validator,
    apiFunction,
    context,
    onUpdateHandler,
}) => {
    const updater = useCallback(async (state, setter) => {
        const validField = state.validator(state.currentValue);
        if (!validField.status) {
            setter({
                ...state,
                error: validField.message.front,
            });
        } else {
            setter({
                ...state,
                attemptingUpdate: true,
            });
        }
    });
    
    const createState = (initialValue, validator, apiFunction) => {
        const [state, setter] = useState({
            currentValue: initialValue,
            inputRef: useRef(null),
            validator: validator,
            apiFunction: apiFunction,
            attemptingUpdate: false,
            error: null,
        });

        createEffect(state, setter);

        return [state, setter];
    };
    
    const createEffect = (state, setter) => {
        useEffect(() => {
            if (state.abortController) state.abortController.abort;
            const abortControllerNew = new AbortController();
            if (state.attemptingUpdate) {
                setter({
                    ...state,
                    abortController: abortControllerNew,
                });
                (async () => {
                    const response = await state.apiFunction(state.currentValue, state.abortController);
                    setter({
                        ...state,
                        abortController: null,
                        attemptingUpdate: false,
                        error: response.status >= 400 ? response.message: null
                    });
                    if (response.status < 400) onUpdateHandler();
                })();
            } else {
                setter({
                    ...state,
                    abortController: abortControllerNew,
                });
            }
    
            return () => {
                if (state.abortController) state.abortController.abort;
            }
        }, [state.attemptingUpdate]);
    }

    const [field, setField] = createState(initialValue, validator, apiFunction);

    let element = null;
    switch (context.type) {
        case "text":
            element = createTextFieldUpdater(field, setField, labelText, fieldName, updater);
            break;
        case "select":
            element = createSelectFieldUpdater(field, setField, labelText, context.options, fieldName, updater);
            break;
        default:
    }

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            {element}
        </div>
        </div>
    );
};

FieldUpdater.propTypes = {
    labelText: PropTypes.string,
    fieldName: PropTypes.string,
    initialValue: function(props, propName, componentName) {
        const propValue = props[propName]
        if (typeof propValue === "undefined") {
            return new Error(`${componentName} is required, got 'undefined'`);
        }
        return;
    },
    validator: PropTypes.func.isRequired,
    apiFunction: PropTypes.func.isRequired,
    context: PropTypes.oneOf([
        PropTypes.shape({ // 'text'-type input
            type: "text",
        }),
        PropTypes.shape({ // 'select'-type input
            type: "select",
            options: PropTypes.arrayOf(PropTypes.string),
        }),
    ]).isRequired,
    onUpdateHandler: PropTypes.func,
}

FieldUpdater.defaultProps = {
    labelText: "Input",
    fieldName: "Field",
    initialValue: undefined,
    onUpdateHandler: () => {},
}

export default FieldUpdater;