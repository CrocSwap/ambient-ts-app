import styles from './InitPool.module.css';
import { useUrlParams } from './useUrlParams';
import { useState } from 'react';
import InitPoolSteps from '../../components/InitPool/InitPoolSteps/InitPoolSteps';
import InitPoolBox from '../../components/InitPool/InitPoolBox/InitPoolBox';
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

    return (
        <main className={styles.main}>
            <div className={styles.init_pool_container}>
                <div className={styles.top_content}>
                    <InitPoolBox />
                    <h2>This is the Initialize Pool Page!</h2>
                </div>
                <InitPoolSteps
                    progressStep={progressStep}
                    setProgressStep={setProgressStep}
                    progressStepsData={progressStepsData}
                />
            </div>
        </main>
    );
}
