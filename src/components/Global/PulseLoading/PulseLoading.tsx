import styles from './PulseLoading.module.css';

export default function PulseLoading() {
    return (
        <div className={styles.main_container}>
            <div className={`${styles.grow} ${styles.grow1}`} />
            <div className={`${styles.grow} ${styles.grow2}`} />
            <div className={`${styles.grow} ${styles.grow3}`} />
            {/* <div className={`${styles.grow} ${styles.grow4}`}/> */}
        </div>
    );
}
