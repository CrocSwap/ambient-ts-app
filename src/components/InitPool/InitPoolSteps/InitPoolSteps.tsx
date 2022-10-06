import styles from './InitPoolSteps.module.css';
import { useState, Dispatch, SetStateAction } from 'react';

interface InitPoolStepsPropsIF {
    progressStepsData: {
        id: number;
        name: string;
    }[];
    progressStep: number;
    setProgressStep: Dispatch<SetStateAction<number>>;
}
export default function InitPoolSteps(props: InitPoolStepsPropsIF) {
    const { progressStepsData, progressStep, setProgressStep } = props;

    const handleChangeStep = (e: any) => {
        e.target.value === 'prev' && progressStep > 0 && setProgressStep(progressStep - 1);
        e.target.value === 'next' &&
            progressStep < progressStepsData.length &&
            setProgressStep(progressStep + 1);
    };

    const stepsDisplay = (
        <div>
            {progressStepsData.map((_, index) => (
                <>
                    {index <= progressStep ? (
                        index === progressStep ? (
                            <p style={{ color: '#db7777' }}>I am active</p>
                        ) : (
                            <p style={{ color: 'green' }}>I am completed</p>
                        )
                    ) : (
                        <p style={{ color: 'grey' }}>I am not active</p>
                    )}
                </>
            ))}
            <hr />
            Step: {progressStep}
            <button value='prev' onClick={handleChangeStep}>
                Previous step
            </button>
            <button value='next' onClick={handleChangeStep}>
                Next step
            </button>
        </div>
    );
    return <div className={styles.container}>yes</div>;
}
