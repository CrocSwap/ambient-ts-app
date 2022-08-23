import { ChangeEventHandler } from 'react';
import styles from './Toggle2.module.css';

interface TogglePropsIF {
    isOn: boolean;
    onColor?: string;
    Width?: boolean | number;
    id: string;
    handleToggle: ChangeEventHandler<HTMLElement>;
    buttonColor?: string;
    disabled?: boolean;
}

export default function Toggle2(props: TogglePropsIF) {
    const { isOn, handleToggle, id, disabled } = props;
    const diabledStyle = disabled ? styles.disabled : '';

    return (
        <label className={`${styles.toggle_switch} ${diabledStyle}`}>
            <input type='checkbox' checked={isOn} onChange={handleToggle} id={`${id}switch`} />

            <span className={styles.switch} />
        </label>
    );
}
