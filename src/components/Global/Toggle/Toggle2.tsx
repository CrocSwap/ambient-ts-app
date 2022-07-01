import styles from './Toggle2.module.css';

interface ToggleProps {
    isOn: boolean;
    onColor?: string;
    Width?: boolean | number;
    id: string;
    handleToggle: React.ChangeEventHandler<HTMLElement>;
    buttonColor?: string;
    disabled?: boolean;
}
function Toggle2(props: ToggleProps) {
    const { isOn, handleToggle, id, disabled } = props;
    const diabledStyle = disabled ? styles.disabled : '';

    return (
        <label className={`${styles.toggle_switch} ${diabledStyle}`}>
            <input type='checkbox' checked={isOn} onChange={handleToggle} id={`${id}switch`} />

            <span className={styles.switch} />
        </label>
    );
}
export default Toggle2;
