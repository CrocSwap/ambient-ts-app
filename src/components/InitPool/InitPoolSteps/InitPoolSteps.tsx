import styles from './InitPoolSteps.module.css';
import { Dispatch, SetStateAction } from 'react';

import { GiCheckMark } from 'react-icons/gi';
interface InitPoolStepsPropsIF {
    progressStepsData: {
        id: number;
        name: string;
        data: JSX.Element;
    }[];
    progressStep: number;
    setProgressStep: Dispatch<SetStateAction<number>>;
    handleChangeStep: (e: string) => void;
}

interface InitStepPropsIF {
    step: {
        id: number;
        name: string;
        data: JSX.Element;
    };
    progressStep: number;
    index: number;
}
function Step(props: InitStepPropsIF) {
    const { step, progressStep, index } = props;

    const activeStyle = (
        <div className={styles.step_active}>
            <div />
        </div>
    );
    const nonActiveStyle = <div className={styles.step_non_active} />;
    const completedStyle = (
        <div className={styles.step_completed}>
            <div>
                <GiCheckMark color='#cdc1ff' />
            </div>
        </div>
    );

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
    const {
        progressStepsData,
        progressStep,
        // setProgressStep, handleChangeStep
    } = props;

    const stepsDisplay = (
        <div className={styles.steps_display_container}>
            {progressStepsData.map((step, index) => (
                <>
                    <Step step={step} index={index} progressStep={progressStep} />
                </>
            ))}

            {/* <button value='prev' onClick={handleChangeStep}>
                Previous step
            </button>
            <button value='next' onClick={handleChangeStep}>
                Next step
            </button> */}
        </div>
    );
    return <div className={styles.container}>{stepsDisplay}</div>;
}
