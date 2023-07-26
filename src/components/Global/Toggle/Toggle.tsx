import { MouseEventHandler, useEffect, KeyboardEventHandler } from 'react';
import styles from './Toggle.module.css';
interface TogglePropsIF {
    isOn: boolean;
    onColor?: string;
    Width?: boolean | number;
    id: string;
    handleToggle:
        | MouseEventHandler<HTMLDivElement>
        | KeyboardEventHandler<HTMLDivElement>
        | undefined
        // eslint-disable-next-line
        | any;
    buttonColor?: string;
    disabled?: boolean;
}

export default function Toggle(props: TogglePropsIF) {
    const { isOn, handleToggle, id, disabled } = props;
    const diabledStyle = disabled ? styles.disabled : '';

    const enterFunction = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleToggle;
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', enterFunction, false);
        return () => {
            document.removeEventListener('keydown', enterFunction, false);
        };
    }, []);

    return (
        <button
            className={`${styles.switch} ${diabledStyle}`}
            data-ison={isOn}
            aria-checked={isOn}
            onClick={handleToggle}
            id={`${id}switch`}
            tabIndex={0}
            role='checkbox'
        >
            <div className={styles.handle} />
        </button>
    );
}
