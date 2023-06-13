import styles from './WalletButton.module.css';
import ambientLogo from '../../../../assets/images/logos/ambient_logo.png';

interface WalletButtonPropsIF {
    disabled?: boolean;
    title: string;
    logo: HTMLElement & SVGElement;
    action: () => void;
}

export default function WalletButton(props: WalletButtonPropsIF) {
    const ariaLabel = `connect to ${props.title} wallet.`;
    return (
        <button
            disabled={props.disabled}
            onClick={() => props.action()}
            className={styles.container}
            style={props.disabled ? { cursor: 'default' } : {}}
            tabIndex={0}
            aria-label={ariaLabel}
        >
            <img
                className={styles.icon}
                src={props.logo ? props.logo : ambientLogo}
                alt=''
            />
            <div className={styles.wallet_name}>{props.title}</div>
        </button>
    );
}
