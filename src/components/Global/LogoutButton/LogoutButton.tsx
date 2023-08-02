import styles from './LogoutButton.module.css';

export const LogoutButton = (props: { onClick: () => void }) => {
    return (
        <button
            className={styles.logout_button}
            onClick={() => props.onClick()}
            tabIndex={0}
            role='button'
        >
            Logout
        </button>
    );
};
