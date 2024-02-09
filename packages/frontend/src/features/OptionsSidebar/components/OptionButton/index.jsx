import PropTypes from 'prop-types';
import styles from './index.module.css';

const OptionButton = ({
    text,
    onClickHandler,
}) => {
    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <button
                className={styles["button"]}
                onClick={(e) => {
                    onClickHandler(e);
                    e.target.blur();
                    e.preventDefault();
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.blur();
                }}
            >{text}</button>
        </div>
        </div>
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