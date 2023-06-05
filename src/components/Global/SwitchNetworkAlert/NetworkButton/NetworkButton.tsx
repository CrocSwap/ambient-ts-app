import { Dispatch, SetStateAction } from 'react';
import styles from './NetworkButton.module.css';

interface NetworkButtonProps {
    name: string;
    theme: string;
    id: string;
    clickHandler: Dispatch<SetStateAction<string>>;
}

export default function NetworkButton(props: NetworkButtonProps) {
    const { name, theme, id, clickHandler } = props;

    return (
        <button
            className={styles.networkButton}
            onClick={() => clickHandler(id)}
            style={{ background: theme }}
        >
            Switch to {name}
        </button>
    );
}
