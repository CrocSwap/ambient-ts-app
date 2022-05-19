import styles from './AdvancedMode.module.css';

interface advancedModeProps {
    children: React.ReactNode;
}

export default function AdvancedMode(props: advancedModeProps) {
    return <div className={styles.AdvancedMode}>{props.children}</div>;
}
