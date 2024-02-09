import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.css";

// When using this component, ensure its parent's 'position' style rule is set to 'relative'

const Tooltip = ({
    text,
    position,
    pixelBuffer,
}) => {
    const [elementSize, setElementSize] = useState([0, 0]);

    const elementRef = useRef(null);

    useEffect(() => {
        if (elementRef.current) {
            setElementSize([
                elementRef.current.offsetWidth,
                elementRef.current.offsetHeight
            ]);
        }
    }, [text, position]);

    let elementTop = "0%";
    let elementLeft = "0%";
    let flexDirection = "column";
    let arrowSides = {}
    switch (position) {
        case "top":
            elementTop = `calc(0% - ${elementSize[1]}px - ${pixelBuffer}px)`;
            elementLeft = `calc(50% - ${elementSize[0] / 2}px)`;
            flexDirection = "column";
            arrowSides = {
                borderLeft: `${Math.min(12, elementSize[0] / 4)}px solid transparent`,
                borderRight: `${Math.min(12, elementSize[0] / 4)}px solid transparent`,
                borderTop: `12px solid white`,
            }
            break;
        case "right":
            elementTop = `calc(50% - ${elementSize[1] / 2}px)`;
            elementLeft = `calc(100% + ${pixelBuffer}px)`;
            flexDirection = "row-reverse";
            arrowSides = {
                borderBottom: `${Math.min(12, elementSize[1] / 4)}px solid transparent`,
                borderTop: `${Math.min(12, elementSize[1] / 4)}px solid transparent`,
                borderRight: `12px solid white`,
            }
            break;
        case "left":
            elementTop = `calc(50% - ${elementSize[1] / 2}px)`;
            elementLeft = `calc(0% - ${elementSize[0]}px - ${pixelBuffer}px)`;
            flexDirection = "row";
            arrowSides = {
                borderBottom: `${Math.min(12, elementSize[1] / 4)}px solid transparent`,
                borderTop: `${Math.min(12, elementSize[1] / 4)}px solid transparent`,
                borderLeft: `12px solid white`,
            }
            break;
        case "bottom":
        default:
            elementTop = `calc(100% + ${pixelBuffer}px)`;
            elementLeft = `calc(50% - ${elementSize[0] / 2}px)`;
            flexDirection = "column-reverse";
            arrowSides = {
                borderLeft: `${Math.min(12, elementSize[0] / 4)}px solid transparent`,
                borderRight: `${Math.min(12, elementSize[0] / 4)}px solid transparent`,
                borderBottom: `12px solid white`,
            }
    }

    return text.length > 0 ? (
        <div
            className={styles["wrapper"]}
            style={{
                pointerEvents: "none",

                top: elementTop,
                left: elementLeft,
            }}
        >
            <div
                className={styles["container"]}
                ref={elementRef}
                style={{
                    flexDirection: flexDirection,
                }}
            >
                <div
                    className={styles["text"]}
                    aria-label="tooltip-text"
                >{text}</div>
                <div
                    className={styles["arrow"]}
                    aria-label="tooltip-arrow"
                    style={{
                        width: "0",
                        height: "0",

                        ...arrowSides,
                    }}
                ></div>
            </div>
        </div>
    ) : null;
};

Tooltip.propTypes = {
    text: PropTypes.string.isRequired,
    position: PropTypes.oneOf(["top", "right", "bottom", "left"]).isRequired,
    pixelBuffer: PropTypes.number,
};

Tooltip.defaultProps = {
    position: "bottom",
    pixelBuffer: 6,
};

export default Tooltip;