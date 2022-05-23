import styles from './Tabs.module.css';

export default function Tabs() {
    return (
        <div className={styles.tabs_container}>
            <div className={styles.tabs}></div>
            <div className={styles.tabs_outlet}></div>
        </div>
    );
}
