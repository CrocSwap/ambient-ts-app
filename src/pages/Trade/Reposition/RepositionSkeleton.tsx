import { Dispatch, SetStateAction, useContext } from 'react';
import ContentContainer from '../../../components/Global/ContentContainer/ContentContainer';
import { RangeContext } from '../../../contexts/RangeContext';
import { TradeModuleHeaderContainer } from '../../../styled/Components/TradeModules';
import { useRepoExitPath } from '../../../components/Trade/Reposition/RepositionHeader/useRepoExitPath';
import { useNavigate } from 'react-router-dom';
import styles from './Reposition.module.css';
import { BiArrowBack } from 'react-icons/bi';
import { TradeDataContext } from '../../../contexts/TradeDataContext';

interface RepositionSkeletonPropsIF {
    // Reposition Header
    positionHash: string;
    setRangeWidthPercentage: Dispatch<SetStateAction<number>>;
    resetTxHash: () => void;
    // Reposition Skeleton
    children: React.ReactNode;
    activeContent?: string;
    handleSetActiveContent: (newActiveContent: string) => void;
    handleReset: () => void;
    setShowStepperComponent: React.Dispatch<React.SetStateAction<boolean>>;
    showStepperComponent: boolean;
}

interface RepositionHeaderPropsIF {
    positionHash: string;
    setRangeWidthPercentage: Dispatch<SetStateAction<number>>;
    resetTxHash: () => void;
    activeContent?: string;
    handleSetActiveContent: (newActiveContent: string) => void;
    handleReset: () => void;
    setShowStepperComponent: React.Dispatch<React.SetStateAction<boolean>>;
    showStepperComponent: boolean;
}

function RepositionHeader(props: RepositionHeaderPropsIF) {
    const {
        setRangeWidthPercentage,
        positionHash,
        resetTxHash,
        activeContent,
        handleSetActiveContent,
        handleReset,
        setShowStepperComponent,
    } = props;

    const {
        setSimpleRangeWidth,
        setCurrentRangeInReposition,
        setAdvancedMode,
    } = useContext(RangeContext);

    const { deactivateConfirmation } = useContext(TradeDataContext);

    const navigate = useNavigate();

    // navpath for when user clicks the exit button
    const exitPath = useRepoExitPath();

    const handleGoBack = () => {
        if (activeContent === 'main') {
            setAdvancedMode(false);
            setRangeWidthPercentage(10);
            setSimpleRangeWidth(10);
            navigate(exitPath, { replace: true });
            resetTxHash();
            setCurrentRangeInReposition('');
        }

        handleSetActiveContent('main');
        deactivateConfirmation();

        handleReset();
        setShowStepperComponent(false);
    };

    return (
        <>
            <TradeModuleHeaderContainer
                flexDirection='row'
                alignItems='center'
                justifyContent='space-between'
                fullWidth
                fontSize='header1'
                color='text2'
            >
                <BiArrowBack
                    onClick={handleGoBack}
                    id='back button'
                    role='button'
                    tabIndex={0}
                    aria-label='back button'
                />
                <p className={styles.title}>
                    {activeContent === 'settings'
                        ? 'Pool Settings'
                        : `Reposition: ${positionHash}`}
                </p>

                <div />
            </TradeModuleHeaderContainer>
        </>
    );
}

export default function RepositionSkeleton(props: RepositionSkeletonPropsIF) {
    const {
        setRangeWidthPercentage,
        positionHash,
        resetTxHash,
        children,
        activeContent,
        handleSetActiveContent,
        handleReset,
        setShowStepperComponent,
        showStepperComponent,
    } = props;

    return (
        <ContentContainer
            isOnTradeRoute
            noPadding={false}
            height={'600px'}
            width={'auto'}
        >
            <RepositionHeader
                setRangeWidthPercentage={setRangeWidthPercentage}
                positionHash={positionHash}
                resetTxHash={resetTxHash}
                activeContent={activeContent}
                handleSetActiveContent={handleSetActiveContent}
                handleReset={handleReset}
                showStepperComponent={showStepperComponent}
                setShowStepperComponent={setShowStepperComponent}
            />

            {children}
        </ContentContainer>
    );
}
