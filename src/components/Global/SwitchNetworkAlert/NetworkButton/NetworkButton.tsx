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
    const { name, theme, id, clickHandler } = props;
    // console.log({ name });

    // const colorInversionfilter = name === 'Görli ' ? 'invert(100%)' : '';

    return (
        <button
            className={styles.networkButton}
            onClick={() => clickHandler(id)}
            style={{ background: theme }}
        >
            {/* <img src={icon} alt={name} style={{ filter: colorInversionfilter }} /> */}
            Switch to {name}
        </button>
    );
}
