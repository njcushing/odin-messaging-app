import { Link } from "react-router-dom";
import PropTypes from 'prop-types';
import styles from './index.module.css';

const NavigationButton = ({
    text,
    onClickHandler,
    link,
}) => {
    return (
        <div className={styles["wrapper"]}>
            <Link
                to={link}
                className={styles["button"]}
                onClick={(e) => {
                    onClickHandler(e);
                    e.target.blur();
                    e.preventDefault();
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.blur();
                }}
            >{text}
            </Link>
        </div>
    )
};

NavigationButton.propTypes = {
    text: PropTypes.string,
    onClickHandler: PropTypes.func,
    link: PropTypes.string,
}

NavigationButton.defaultProps = {
    text: "Button",
    onClickHandler: null,
    link: "",
}

export default NavigationButton;