import styles from './InitPool.module.css';
import { useUrlParams } from './useUrlParams';
import { useState } from 'react';
import InitPoolSteps from '../../components/InitPool/InitPoolSteps/InitPoolSteps';
import InitPoolSummary from '../../components/InitPool/InitPoolSummary/InitPoolSummary';
import ContentContainer from '../../components/Global/ContentContainer/ContentContainer';
import Button from '../../components/Global/Button/Button';
import { MdOutlineArrowBackIosNew } from 'react-icons/md';
import ChooseTokens from '../../components/InitPool/ChooseTokens/ChooseTokens';
import SetPoolFees from '../../components/InitPool/SetPoolFees/SetPoolFees';
import SetInitialLiquidity from '../../components/InitPool/SetInitialLiquidity/SetInitialLiquidity';
import ConfirmPoolCreation from '../../components/InitPool/ConfirmPoolCreation/ConfirmPoolCreation';

const animationsNext = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
};
const animationsBack = {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
};

interface InitPoolPropsIf {
    showSidebar: boolean;
}
export default function InitPool(props: InitPoolPropsIf) {
    const { showSidebar } = props;
    const newPoolData = useUrlParams();
    console.log(newPoolData);
    const [progressStep, setProgressStep] = useState(0);
    const [animation, setAnimation] = useState(animationsNext);

    const setPoolFeesProps = {
        animation: animation,
    };
    const setInitialLiquidityProps = {
        animation: animation,
    };
    const confirmPoolCreationProps = {
        animation: animation,
    };
    const chooseTokensProps = {
        animation: animation,
    };

    const progressStepsData = [
        { id: 1, name: 'Choose tokens & weights', data: <ChooseTokens {...chooseTokensProps} /> },
        { id: 2, name: 'Set pool fees', data: <SetPoolFees {...setPoolFeesProps} /> },
        {
            id: 3,
            name: 'Set initial liquidity',
            data: <SetInitialLiquidity {...setInitialLiquidityProps} />,
        },
        {
            id: 4,
            name: 'Confirm  pool creation',
            data: <ConfirmPoolCreation {...confirmPoolCreationProps} />,
        },
    ];

    const handleChangeStep = (e: string) => {
        if (e === 'prev' && progressStep > 0) {
            setProgressStep(progressStep - 1);
            setAnimation(animationsBack);
        } else if (e === 'next' && progressStep < progressStepsData.length) {
            setProgressStep(progressStep + 1);
            setAnimation(animationsNext);
        }
    };

    return (
        <main
            className={styles.main}
            style={{ justifyContent: showSidebar ? 'flex-start' : 'center' }}
        >
            <div
                className={styles.init_pool_container}
                style={{ marginLeft: showSidebar ? '15rem' : '' }}
            >
                <div className={styles.top_content}>
                    <ContentContainer>
                        <header>
                            <h1>{progressStepsData[progressStep].name}</h1>
                            {progressStepsData[progressStep - 1] && (
                                <p onClick={() => handleChangeStep('prev')}>
                                    <MdOutlineArrowBackIosNew />
                                    {progressStepsData[progressStep - 1].name}
                                </p>
                            )}
                        </header>
                        {progressStepsData[progressStep].data}
                        <footer>
                            <Button
                                title='Next'
                                action={
                                    progressStep === progressStepsData.length - 1
                                        ? () => console.log('completed')
                                        : () => handleChangeStep('next')
                                }
                            />
                        </footer>
                    </ContentContainer>
                    <InitPoolSummary />
                </div>
                <InitPoolSteps
                    progressStep={progressStep}
                    setProgressStep={setProgressStep}
                    progressStepsData={progressStepsData}
                    handleChangeStep={handleChangeStep}
                />
            </div>
        </main>
    );
}
