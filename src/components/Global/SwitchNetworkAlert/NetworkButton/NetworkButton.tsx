import styles from './NetworkButton.module.css';

interface NetworkButtonProps {
    name: string;
    icon: string;
    theme: string;
    id: string;
    handleClick: (chainId: string) => void;
}

export default function NetworkButton(props: NetworkButtonProps) {
    const { name, icon, theme, id, handleClick } = props;

    return (
        <button
            className={styles.networkButton}
            onClick={() => handleClick(id)}
            style={{ background: theme }}
        >
            <img src={icon} alt={name} />
            Switch to {name}
        </button>
    );
}
