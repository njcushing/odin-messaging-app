import { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.css";

import Tooltip from "@/components/Tooltip";

const createErrorMessageContainer = (state) => {
    return (
        state.error !== null
        ?   <h3
                className={styles["error"]}
                aria-label="text-input-error"
            >{state.error}</h3>
        :   null
    );
}

const createUpdateButton = (state, setter, updater) => {
    return (
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
    );
}

const createInputContainer = (state, setter, labelText, updater, input) => {
    return (
        <div className={styles["field-container"]}>
        <label className={styles["label"]}
        >{labelText}:
            <div className={styles["text-input-and-button-container"]}>
                {input}
                {createUpdateButton(state, setter, updater)}
            </div>
        </label>
        {createErrorMessageContainer(state)}
        </div>
    );
}

const createOtherFieldContainer = (state, setter, title, updater, input) => {
    return (
        <div className={styles["field-container"]}>
        <h2 className={styles["title"]}>{title}:</h2>
        <div className={styles["text-input-and-button-container"]}>
            {input}
            {createUpdateButton(state, setter, updater)}
        </div>
        {createErrorMessageContainer(state)}
        </div>
    );
}

const createTextFieldUpdater = (state, setter, labelText, context, fieldName, updater) => {
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

const createSelectFieldUpdater = (state, setter, labelText, context, fieldName, updater) => {
    const input = (
        <select
            className={styles[`select${state.error !== null ? "-error" : ""}`]}
            id={fieldName}
            name={fieldName}
            defaultValue={state.currentValue}
            style={{ resize: "none" }}
            onChange={(e) => {
                const validValue = state.validator(context.options[e.target.selectedIndex]);
                setter({
                    ...state,
                    error: !validValue.status ? validValue.message.front : null,
                    currentValue: context.options[e.target.selectedIndex],
                });
            }}
            disabled={state.attemptingUpdate}
            ref={state.inputRef}
        >
            {context.options.map((option) => {
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

const createCirclesFieldUpdater = (state, setter, labelText, context, fieldName, updater) => {
    const input = (
        <div className={styles["circles-wrapper"]}>
            {context.options.map((option) => {
                return (
                    <div
                        className={styles["circle-container"]}
                        style={{
                            position: "relative", // Needed for Tooltip positioning
                            display: "flex"
                        }}
                        key={option.name}
                    >
                        <button
                            className={styles[`circle${state.currentValue === option.name ? "-selected" : ""}`]}
                            aria-label={fieldName}
                            onClick={(e) => {
                                const validValue = state.validator(option.name);
                                setter({
                                    ...state,
                                    error: !validValue.status ? validValue.message.front : null,
                                    currentValue: option.name,
                                });
                                e.currentTarget.blur();
                                e.preventDefault();
                            }}
                            onMouseEnter={() => {
                                setter({
                                    ...state,
                                    tooltip: {
                                        id: option.name,
                                        element:
                                            <Tooltip
                                                text={option.tooltipText.charAt(0).toUpperCase() + option.tooltipText.slice(1)}
                                                position={option.tooltipPosition}
                                            />
                                    }
                                });
                            }}
                            onMouseLeave={(e) => {
                                setter({
                                    ...state,
                                    tooltip: { id: "", element: null },
                                });
                            }}
                            style={{
                                backgroundColor: option.colour,

                                width: `${context.widthPx}px`,
                                height: `${context.heightPx}px`,
                            }}
                        ></button>
                        {
                            state.tooltip.element && state.tooltip.id === option.name
                            ?   state.tooltip.element
                            :   null
                        }
                    </div>
                );
            })}
        </div>
    );
    return createOtherFieldContainer(state, setter, labelText, updater, input);
}

const createImageFieldUpdater = (state, setter, labelText, context, fieldName, updater) => {
    let imgSrc = null;
    if (Array.isArray(state.currentValue)) {
        const blob = new Blob([Buffer.from(state.currentValue)], { type: "image/png" });
        imgSrc = URL.createObjectURL(blob);
    }

    const input = (
        <>
        <img
            className={styles["image-container"]}
            src={imgSrc}
        ></img>    
        <label
            className={styles[`browse-button`]}
            aria-label="browse-images"
            onClick={(e) => {
                e.currentTarget.blur();
            }}
            onMouseLeave={(e) => {
                e.currentTarget.blur();
            }}
        >Browse
            <input
                className={styles[`image-input${state.error !== null ? "-error" : ""}`]}
                id={fieldName}
                name={fieldName}
                type="file"
                accept="image/*"
                style={{ resize: "none" }}
                onChange={(e) => {
                    const file = new FileReader();
                    file.readAsArrayBuffer(e.target.files[0]);
                    file.onloadend = (e) => {
                        if (e.target.error) return;
                        const imgArray = Array.from(new Uint8Array(e.target.result));
                        const validValue = state.validator(imgArray);
                        setter({
                            ...state,
                            error: !validValue.status ? validValue.message.front : null,
                            currentValue: validValue.status ? imgArray : state.currentValue,
                        });
                    }
                }}
                disabled={state.attemptingUpdate}
                ref={state.inputRef}
            ></input>
        </label>
        </>
    );
    return createOtherFieldContainer(state, setter, labelText, updater, input);
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
            abortController: null,
            tooltip: { id: "", element: null },
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
            element = createTextFieldUpdater(field, setField, labelText, context, fieldName, updater);
            break;
        case "select":
            element = createSelectFieldUpdater(field, setField, labelText, context, fieldName, updater);
            break;
        case "circles":
            element = createCirclesFieldUpdater(field, setField, labelText, context, fieldName, updater);
            break;
        case "image":
            element = createImageFieldUpdater(field, setField, labelText, context, fieldName, updater);
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
        PropTypes.shape({ // Any number of circular 'buttons'
            type: "circles",
            options: PropTypes.arrayOf(PropTypes.shape({
                name: PropTypes.string,
                colour: PropTypes.string,
                image: null,
                tooltipText: PropTypes.string,
                tooltipPosition: PropTypes.oneOf(["bottom", "top", "left", "right"]),
            })),
            widthPx: PropTypes.string,
            heightPx: PropTypes.string,
        }),
        PropTypes.shape({ // for images
            type: "image",
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