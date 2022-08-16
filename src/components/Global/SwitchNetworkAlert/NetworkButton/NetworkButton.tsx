import { Dispatch, SetStateAction } from 'react';
import styles from './NetworkButton.module.css';

interface NetworkButtonProps {
    name: string;
    icon: string;
    theme: string;
    id: string;
    clickHandler: Dispatch<SetStateAction<string>>;
}

export default function NetworkButton(props: NetworkButtonProps) {
    const { name, icon, theme, id, clickHandler } = props;

    return (
        <button
            className={styles.networkButton}
            onClick={() => clickHandler(id)}
            style={{ background: theme }}
        >
            <img src={icon} alt={name} />
            Switch to {name}
        </button>
    );
}
