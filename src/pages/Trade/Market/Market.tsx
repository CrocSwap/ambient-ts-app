import styles from './Market.module.css';

export default function Market() {
    return (
        <section data-testid={'market'}>
            <main className={styles.main_layout}>
                <div className={styles.middle_col}>
                    <h1>THIS IS GRAPH COMPONENT FOR MARKEY</h1>
                </div>
                <div className={styles.right_col}>
                    <h1>THIS IS MARKET</h1>
                </div>
            </main>
        </section>
    );
}
