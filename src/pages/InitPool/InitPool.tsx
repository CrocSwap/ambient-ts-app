import styles from './InitPool.module.css';
import { useUrlParams } from './useUrlParams';

export default function InitPool() {
    const newPoolData = useUrlParams();
    console.log(newPoolData);

    const progressSteps = [
        { id: 1, name: 'Choose tokens & weights' },
        { id: 2, name: 'Set pool fees' },
        { id: 3, name: 'Set initial liquidity' },
        { id: 4, name: 'Confirm  pool creation' },
    ];

    return (
        <main className={styles.main}>
            <div className={styles.init_pool_container}>
                <h2>This is the Initialize Pool Page!</h2>
            </div>
        </main>
    );
}
