import PropTypes from 'prop-types';
import './index.css';

const OptionButton = ({
    text,
    onClickHandler,
}) => {
    return (
        <button
            className="option-button"
            aria-label={"option-button"}
            onClick={(e) => {
                onClickHandler(e);
                e.currentTarget.blur();
                e.preventDefault();
            }}
            onMouseLeave={(e) => {
                e.currentTarget.blur();
            }}
        >
            <ul><li className="material-symbols-rounded">{text}</li></ul>
        </button>
    )
};

OptionButton.propTypes = {
    text: PropTypes.string,
    onClickHandler: PropTypes.func.isRequired,
}

OptionButton.defaultProps = {
    text: "Button",
}

export default OptionButton;