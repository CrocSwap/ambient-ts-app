import styles from './InitPool.module.css';
import { useUrlParams } from './useUrlParams';
import { useState } from 'react';
import InitPoolSteps from '../../components/InitPool/InitPoolSteps/InitPoolSteps';
import InitPoolBox from '../../components/InitPool/InitPoolBox/InitPoolBox';
import InitPoolSummary from '../../components/InitPool/InitPoolSummary/InitPoolSummary';
import ContentContainer from '../../components/Global/ContentContainer/ContentContainer';
import ContentHeader from '../../components/Global/ContentHeader/ContentHeader';
import Button from '../../components/Global/Button/Button';
import { MdOutlineArrowBackIosNew } from 'react-icons/md';
import ChooseTokens from '../../components/InitPool/ChooseTokens/ChooseTokens';
import SetPoolFees from '../../components/InitPool/SetPoolFees/SetPoolFees';
import SetInitialLiquidity from '../../components/InitPool/SetInitialLiquidity/SetInitialLiquidity';
import ConfirmPoolCreation from '../../components/InitPool/ConfirmPoolCreation/ConfirmPoolCreation';
export default function InitPool() {
    const newPoolData = useUrlParams();
    console.log(newPoolData);

    const progressStepsData = [
        { id: 1, name: 'Choose tokens & weights', data: <ChooseTokens /> },
        { id: 2, name: 'Set pool fees', data: <SetPoolFees /> },
        { id: 3, name: 'Set initial liquidity', data: <SetInitialLiquidity /> },
        { id: 4, name: 'Confirm  pool creation', data: <ConfirmPoolCreation /> },
    ];

    const handleChangeStep = (e: string) => {
        e === 'prev' && progressStep > 0 && setProgressStep(progressStep - 1);
        e === 'next' &&
            progressStep < progressStepsData.length &&
            setProgressStep(progressStep + 1);
    };

    const [progressStep, setProgressStep] = useState(0);
    console.log(progressStep);

    return (
        <main className={styles.main}>
            <div className={styles.init_pool_container}>
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
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro possimus
                        quaerat perferendis quia, exercitationem eligendi harum magni consectetur,
                        voluptatibus ad libero. Omnis ea tempore quis, aperiam repellendus,
                        aspernatur ipsum assumenda hic iste sunt modi velit est ullam expedita eius
                        possimus? Dolores necessitatibus non temporibus perspiciatis, delectus nisi
                        corrupti, cum quas inventore, deleniti iure! Ab maxime reprehenderit cumque
                        et culpa eius minus eum nemo doloremque, exercitationem voluptatum saepe ad
                        quidem maiores repellendus inventore fugiat aut rerum! Quam exercitationem
                        animi voluptate minima nihil impedit assumenda nisi vitae cupiditate totam
                        rem quaerat laboriosam adipisci ullam facere dicta, hic ex placeat itaque
                        libero quibusdam.
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
