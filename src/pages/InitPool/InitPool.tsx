import styles from './InitPool.module.css';
import { useUrlParams } from './useUrlParams';
import { useState } from 'react';
export default function InitPool() {
    const newPoolData = useUrlParams();
    console.log(newPoolData);

    const progressStepsData = [
        { id: 1, name: 'Choose tokens & weights' },
        { id: 2, name: 'Set pool fees' },
        { id: 3, name: 'Set initial liquidity' },
        { id: 4, name: 'Confirm  pool creation' },
    ];

    const [progressStep, setProgressStep] = useState(0);

    const handleChangeStep = (e: any) => {
        e.target.value === 'prev' && progressStep > 0 && setProgressStep(progressStep - 1);
        e.target.value === 'next' &&
            progressStep < progressStepsData.length &&
            setProgressStep(progressStep + 1);
    };

    return (
        <main className={styles.main}>
            <div className={styles.init_pool_container}>
                <h2>This is the Initialize Pool Page!</h2>
            </div>
        </main>
    );
}
