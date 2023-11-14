import styles from './Medal.module.css';

interface MedalPropsIF {
    ranking: number;
}
export default function Medal(props: MedalPropsIF) {
    const { ranking } = props;

    const goldMedal = (
        <div className={styles.quiz_medal}>
            <div
                className={`${styles.quiz_medal__circle} ${styles.quiz_medal__circle__gold}`}
            >
                <span>1</span>
            </div>
            <div
                className={`${styles.quiz_medal__ribbon} ${styles.quiz_medal__ribbon__left}`}
            />
            <div
                className={`${styles.quiz_medal__ribbon} ${styles.quiz_medal__ribbon__right}`}
            />
        </div>
    );
    const silverMedal = (
        <div className={styles.quiz_medal}>
            <div
                className={`${styles.quiz_medal__circle} ${styles.quiz_medal__circle__silver}`}
            >
                <span>2</span>
            </div>
            <div
                className={`${styles.quiz_medal__ribbon} ${styles.quiz_medal__ribbon__left}`}
            />
            <div
                className={`${styles.quiz_medal__ribbon} ${styles.quiz_medal__ribbon__right}`}
            />
        </div>
    );
    const bronzeMedal = (
        <div className={styles.quiz_medal}>
            <div
                className={`${styles.quiz_medal__circle} ${styles.quiz_medal__circle__bronze}`}
            >
                <span>3</span>
            </div>
            <div
                className={`${styles.quiz_medal__ribbon} ${styles.quiz_medal__ribbon__left}`}
            />
            <div
                className={`${styles.quiz_medal__ribbon} ${styles.quiz_medal__ribbon__right}`}
            />
        </div>
    );

    const simpleMedal = (
        <div className={styles.quiz_medal}>
            <div
                className={`${styles.quiz_medal__circle_simple} ${styles.quiz_medal__circle__simple}`}
            >
                <span>{ranking}</span>
            </div>
            {/* <div className={`${styles.quiz_medal__ribbon} ${styles.quiz_medal__ribbon__left}`}/>
            <div className={`${styles.quiz_medal__ribbon} ${styles.quiz_medal__ribbon__right}`}/> */}
        </div>
    );

    if (ranking === 1) {
        return goldMedal;
    } else if (ranking === 2) {
        return silverMedal;
    } else if (ranking === 3) {
        return bronzeMedal;
    } else return <>{simpleMedal}</>;
}
