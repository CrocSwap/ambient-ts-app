import { Dispatch, SetStateAction } from 'react';
import styles from './NetworkButton.module.css';

interface propsIF {
    name: string;
    theme: string;
    id: string;
    clickHandler: Dispatch<SetStateAction<string>>;
}

export default function NetworkButton(props: propsIF) {
    const { name, theme, id, clickHandler } = props;

    return (
        <button
            className={styles.networkButton}
            onClick={() => clickHandler(id)}
            style={{ background: theme, cursor: 'pointer' }}
        >
            Switch to {name}
        </button>
    );
}
