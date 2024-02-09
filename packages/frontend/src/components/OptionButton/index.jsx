import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import './index.css';

import Tooltip from "@/components/Tooltip";

const OptionButton = ({
    text,
    tooltipText,
    tooltipPosition,
    widthPx,
    heightPx,
    fontSizePx,
    borderStyle,
    onClickHandler,
}) => {
    const [tooltipElement, setTooltipElement] = useState(null);

    let borderRadius;
    switch (borderStyle) {
        case "rectangular":
            borderRadius = `0rem`;
            break;
        case "circular":
            borderRadius = `9999rem`;
            break;
        case "rounded":
        default:
            borderRadius = `0.2rem`;
            break;
    }

    return (
        <div
            className="container"
            style={{
                position: "relative",
            }}
        >
        <button
            className="option-button"
            aria-label={"option-button"}
            onClick={(e) => {
                onClickHandler(e);
                e.currentTarget.blur();
                e.preventDefault();
            }}
            onMouseEnter={() => {
                setTooltipElement(
                    <Tooltip
                        text={tooltipText}
                        position={tooltipPosition}
                    />
                );
            }}
            onMouseLeave={(e) => {
                e.currentTarget.blur();
                setTooltipElement(null);
            }}
            style={{
                borderRadius: borderRadius,

                width: `${widthPx}px`,
                height: `${heightPx}px`,
            }}
        >
            <ul><li
                className="material-symbols-rounded"
                style={{
                    fontSize: `${fontSizePx}px`
                }}
            >{text}</li></ul>
        </button>
        {tooltipElement}
        </div>
    )
};

OptionButton.propTypes = {
    text: PropTypes.string.isRequired,
    tooltipText: PropTypes.string.isRequired,
    tooltipPosition: PropTypes.oneOf(["top", "right", "bottom", "left"]),
    widthPx: PropTypes.number,
    heightPx: PropTypes.number,
    fontSizePx: PropTypes.number,
    borderStyle: PropTypes.oneOf(["rectangular", "rounded", "circular"]),
    onClickHandler: PropTypes.func,
}

OptionButton.defaultProps = {
    tooltipPosition: "bottom",
    widthPx: 64,
    heightPx: 64,
    fontSizePx: 32,
    borderStyle: "rounded",
    onClickHandler: () => {},
}

export default OptionButton;