import styles from './InitPool.module.css';
import { useUrlParams } from './useUrlParams';

export default function InitPool() {
    const newPoolData = useUrlParams();
    console.log(newPoolData);

    return (
        <main className={styles.main}>
            <div className={styles.init_pool_container}>
                <h2>This is the Initialize Pool Page!</h2>
            </div>
        </main>
    );
}
