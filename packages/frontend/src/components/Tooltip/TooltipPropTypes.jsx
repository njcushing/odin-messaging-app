import PropTypes from "prop-types";

const TooltipPropTypes = {
    text: PropTypes.string,
    position: PropTypes.oneOf(["top", "right", "bottom", "left"]),
    pixelBuffer: PropTypes.number,
}

export default TooltipPropTypes;