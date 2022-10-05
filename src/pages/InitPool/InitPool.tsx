import styles from './InitPool.module.css';
import { useUrlParams } from './useUrlParams';

export default function InitPool() {
    useUrlParams();

    return (
        <main className={styles.main}>
            <h2>This is the Initialize Pool Page!</h2>
        </main>
    );
}