import { MouseEventHandler, useEffect, KeyboardEventHandler } from 'react';
import styles from './Toggle2.module.css';
import { motion } from 'framer-motion';
interface TogglePropsIF {
    isOn: boolean;
    onColor?: string;
    Width?: boolean | number;
    id: string;
    handleToggle:
        | MouseEventHandler<HTMLDivElement>
        | KeyboardEventHandler<HTMLDivElement>
        | undefined
        | any;
    buttonColor?: string;
    disabled?: boolean;
}

export default function Toggle2(props: TogglePropsIF) {
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
        // <label className={`${styles.toggle_switch} ${diabledStyle}`}>
        //     <input type='checkbox' checked={isOn} onChange={handleToggle} id={`${id}switch`} />

        //     <span className={styles.switch} />
        // </label>
        <div
            className={`${styles.switch} ${diabledStyle}`}
            data-ison={isOn}
            aria-checked={isOn}
            onClick={handleToggle}
            // aria-live='polite'
            onKeyDown={handleToggle}
            id={`${id}switch`}
            tabIndex={0}
            role='checkbox'
        >
            <motion.div className={styles.handle} layout transition={spring} />
        </div>
    );
}

const spring = {
    type: 'spring',
    stiffness: 700,
    damping: 30,
};
