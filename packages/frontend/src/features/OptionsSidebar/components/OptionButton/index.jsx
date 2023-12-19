import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import './index.css';

import Tooltip from "@/components/Tooltip";
import TooltipPropTypes from "@/components/Tooltip/TooltipPropTypes.jsx";

const OptionButton = ({
    text,
    tooltipText,
    tooltipPosition,
    onClickHandler,
}) => {
    const [tooltipElement, setTooltipElement] = useState(null);

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
        >
            <ul><li className="material-symbols-rounded">{text}</li></ul>
        </button>
        {tooltipElement}
        </div>
    )
};

OptionButton.propTypes = {
    text: PropTypes.string.isRequired,
    tooltipText: PropTypes.string.isRequired,
    tooltipPosition: TooltipPropTypes.position,
    onClickHandler: PropTypes.func.isRequired,
}

OptionButton.propTypes = {
    tooltipPosition: "bottom",
}

export default OptionButton;