import styles from './ConnectWalletButton.module.css';

export const ConnectWalletButton = (props: {
    onClick: () => void;
    thin?: boolean;
    isMobile?: boolean;
}) => {
    return (
        <button
            className={styles.connect_wallet_button}
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
