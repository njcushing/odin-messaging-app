import PropTypes from 'prop-types';
import styles from './index.module.css'

import NavigationButton from './components/NavigationButton';

const NavBar = ({
    options,
}) => {
    return (
        <div className={styles["wrapper"]}>
        <nav className={styles["container"]}>
            <ul className={styles["navigation-buttons-list"]}>
                {options.map((option, i) => {
                    return (
                        <li
                            className={styles["navigation-button"]}
                            key={i}
                        >
                            <NavigationButton
                                text={option.text}
                                onClickHandler={option.onClickHandler}
                                link={option.link}
                            />
                        </li>
                    );
                })}
            </ul>
        </nav>
        </div>
    );
};

NavBar.propTypes = {
    options: PropTypes.arrayOf(PropTypes.shape({
        ...NavigationButton.propTypes,
    })),
}

NavBar.defaultProps = {
    options: [],
}

export default NavBar;