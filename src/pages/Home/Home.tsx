import styles from './Home.module.css';

export default function Home() {
    const ambientText = (
        <div className={styles.text_container}>
            <div className={`${styles.sign} ${styles.light}`} id='one'>
                A
            </div>
            <div className={`${styles.sign} ${styles.light}`} id='two'>
                M
            </div>
            <div className={`${styles.sign} ${styles.light}`} id='three'>
                B
            </div>
            <div className={`${styles.sign} ${styles.light}`} id='four'>
                I
            </div>
            <div className={`${styles.sign} ${styles.non_light}`} id='four'>
                E
            </div>
            <div className={`${styles.sign} ${styles.non_light}`} id='four'>
                N
            </div>
            <div className={`${styles.sign} ${styles.non_light}`} id='four'>
                T
            </div>
        </div>
    );

    return (
        <main data-testid={'home'} className={styles.home_container}>
            {/* {ambientImage} */}
            {ambientText}
        </main>
    );
}
