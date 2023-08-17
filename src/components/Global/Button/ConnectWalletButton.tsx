import styles from './Button.module.css';

export const ConnectWalletButton = (props: {
    onClick: () => void;
    thin?: boolean;
    isMobile?: boolean;
}) => {
    return (
        <button
            className={`${styles.btn_flat} ${styles.btn}`}
            style={
                props.thin
                    ? { height: '28px', width: '156px', padding: 0 }
                    : props.isMobile
                    ? { width: '140px' }
                    : undefined
            }
            onClick={() => props.onClick()}
            tabIndex={0}
            role='button'
        >
            {!props.isMobile ? 'Connect Wallet' : 'Connect'}
        </button>
    );
};
