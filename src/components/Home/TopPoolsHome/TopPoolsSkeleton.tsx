import styles from './TopPoolsSkeleton.module.css';
export default function TopPoolsSkeleton() {
    return (
        <div className={styles.container}>
            <div className={styles.topContainer}>
                <div className={styles.topLeftContainer}>
                    <span />
                    <span />
                </div>
                <div className={styles.topRightContainer} />
            </div>

            <div className={styles.bottomContainer}>
                <div className={styles.bottomLeftContainer}>
                    <span />
                    <span />
                </div>
                <div className={styles.bottomRightContainer}>
                    <span />
                    <span />
                </div>
            </div>
        </div>
    );
}
