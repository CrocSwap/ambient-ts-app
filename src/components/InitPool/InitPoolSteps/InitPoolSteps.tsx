import styles from './InitPoolSteps.module.css';
import { useState, Dispatch, SetStateAction } from 'react';
import { act } from 'react-dom/test-utils';

interface InitPoolStepsPropsIF {
    progressStepsData: {
        id: number;
        name: string;
    }[];
    progressStep: number;
    setProgressStep: Dispatch<SetStateAction<number>>;
}

interface InitStepPropsIF {
    step: {
        id: number;
        name: string;
    };
    progressStep: number;
    index: number;
}
function Step(props: InitStepPropsIF) {
    const { step, progressStep, index } = props;

    const activeStyle = (
        <div className={styles.step_active}>
            <div />{' '}
        </div>
    );
    const nonActiveStyle = <div className={styles.step_non_active} />;
    const completedStyle = <div className={styles.step_completed} />;

    return (
        <div>
            {index <= progressStep ? (
                index === progressStep ? (
                    <div className={styles.step_content}>
                        {activeStyle}
                        <p>{step.name}</p>
                    </div>
                ) : (
                    <div className={styles.step_content}>
                        {completedStyle}
                        <p>{step.name}</p>
                    </div>
                )
            ) : (
                <div className={styles.step_content}>
                    {nonActiveStyle}
                    <p>{step.name}</p>
                </div>
            )}
        </div>
    );
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
        <div className={styles.steps_display_container}>
            {progressStepsData.map((step, index) => (
                <>
                    <Step step={step} index={index} progressStep={progressStep} />
                </>
            ))}

            <button value='prev' onClick={handleChangeStep}>
                Previous step
            </button>
            <button value='next' onClick={handleChangeStep}>
                Next step
            </button>
        </div>
    );
    return <div className={styles.container}>{stepsDisplay}</div>;
}
