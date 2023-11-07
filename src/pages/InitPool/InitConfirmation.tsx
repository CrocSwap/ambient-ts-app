import styled from 'styled-components/macro';
import Button from '../../components/Form/Button';
import { Dispatch, SetStateAction, useEffect } from 'react';
import StepperComponent from '../../components/Global/MultiStepTransaction/StepperComponent';
import SelectedRange from '../../components/Trade/Range/ConfirmRangeModal/SelectedRange/SelectedRange';
import { FlexContainer, GridContainer, Text } from '../../styled/Common';

import { FeaturedBox } from '../../components/Trade/TableInfo/FeaturedBox';
import { TokenIF } from '../../utils/interfaces/TokenIF';

const Wrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;

    border-radius: 8px;

    text-align: center;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    padding-top: 64px;
`;

interface InitConfirmationProps {
    activeContent: string;
    setActiveContent: (key: string) => void;
    sendTx: () => void;
    transactionApprovedInit: boolean;
    transactionApprovedRange: boolean;
    isTransactionDenied: boolean;
    isTransactionException: boolean;
    tokenA: TokenIF;
    tokenB: TokenIF;
    isAmbient: boolean;
    isTokenABase: boolean;
    isTxCompletedInit: boolean;
    isTxCompletedRange: boolean;
    errorCode?: string;
    handleNavigation: () => void;
    pinnedMinPriceDisplayTruncatedInBase: string;
    pinnedMinPriceDisplayTruncatedInQuote: string;
    pinnedMaxPriceDisplayTruncatedInBase: string;
    pinnedMaxPriceDisplayTruncatedInQuote: string;
    tokenACollateral: string;
    tokenBCollateral: string;
    isDenomBase: boolean;
    setIsDenomBase: Dispatch<SetStateAction<boolean>>;
    activeStep: number;
    setActiveStep: React.Dispatch<React.SetStateAction<number>>;
    isConfirmed: boolean;
    setIsConfirmed: React.Dispatch<React.SetStateAction<boolean>>;
    isMintLiqEnabled: boolean;
    initialPriceInBaseDenom: number | undefined;
}

export default function InitConfirmation(props: InitConfirmationProps) {
    const {
        sendTx,
        transactionApprovedInit,
        transactionApprovedRange,
        isTransactionDenied,
        isTransactionException,
        tokenA,
        tokenB,
        isAmbient,
        isTokenABase,
        isTxCompletedInit,
        handleNavigation,
        isTxCompletedRange,
        pinnedMinPriceDisplayTruncatedInBase,
        pinnedMinPriceDisplayTruncatedInQuote,
        pinnedMaxPriceDisplayTruncatedInBase,
        pinnedMaxPriceDisplayTruncatedInQuote,

        isDenomBase,
        setIsDenomBase,

        tokenACollateral,
        tokenBCollateral,

        activeStep,
        setActiveStep,

        isConfirmed,
        setIsConfirmed,

        isMintLiqEnabled,
        initialPriceInBaseDenom,
    } = props;

    const tokensInfo = (
        <GridContainer numCols={2} gap={8}>
            <FeaturedBox
                pooled={
                    isMintLiqEnabled && tokenACollateral
                        ? tokenACollateral
                        : '0.00'
                }
                token={tokenA}
                isInit
            />
            <FeaturedBox
                pooled={
                    isMintLiqEnabled && tokenBCollateral
                        ? tokenBCollateral
                        : '0.00'
                }
                token={tokenB}
                isInit
            />
        </GridContainer>
    );

    const selectedRangeDisplay = (
        <SelectedRange
            isTokenABase={isTokenABase}
            isAmbient={isAmbient}
            pinnedMinPriceDisplayTruncatedInBase={
                pinnedMinPriceDisplayTruncatedInBase
            }
            pinnedMinPriceDisplayTruncatedInQuote={
                pinnedMinPriceDisplayTruncatedInQuote
            }
            pinnedMaxPriceDisplayTruncatedInBase={
                pinnedMaxPriceDisplayTruncatedInBase
            }
            pinnedMaxPriceDisplayTruncatedInQuote={
                pinnedMaxPriceDisplayTruncatedInQuote
            }
            isDenomBase={isDenomBase}
            setIsDenomBase={setIsDenomBase}
            showOnlyFeeTier={!isMintLiqEnabled}
            initialPrice={initialPriceInBaseDenom}
            isInitPage
        />
    );

    const poolTokenDisplay = (
        <FlexContainer
            flexDirection='column'
            justifyContent='space-between'
            alignItems='center'
            style={{
                margin: '0 auto',
                height: '100%',
                maxWidth: '478px',
            }}
        >
            <FlexContainer
                flexDirection='column'
                gap={8}
                justifyContent={!isMintLiqEnabled ? 'center' : undefined}
                style={{ height: '100%' }}
            >
                {tokensInfo}
                {selectedRangeDisplay}
            </FlexContainer>

            <Button
                flat
                title='Initialize Pool'
                action={handleConfirmed}
                width='350px'
            />
        </FlexContainer>
    );

    function handleConfirmed() {
        setIsConfirmed(true);
        sendTx();
    }

    const tokenSymbols = isTokenABase
        ? `${tokenA.symbol} / ${tokenB.symbol}`
        : `${tokenB.symbol} / ${tokenA.symbol}`;

    const noMintLiqSteps = [
        { label: 'Sign transaction to initialize pool' },
        {
            label: `Submitting pool initialization for ${tokenSymbols}`,
        },
    ];

    const mintLiqSteps = [
        { label: 'Sign transaction to initialize pool' },
        {
            label: `Submitting pool initialization for ${tokenSymbols}`,
        },
        { label: 'Sign transaction to mint liquidity' },
        {
            label: `Submitting liquidity for ${tokenSymbols}`,
        },
    ];

    const steps = isMintLiqEnabled ? mintLiqSteps : noMintLiqSteps;

    useEffect(() => {
        setActiveStep(0);
        if (transactionApprovedInit) {
            setActiveStep(1);
        }
        if (isTxCompletedInit) {
            setActiveStep(2);
        }

        if (transactionApprovedRange) {
            setActiveStep(3);
        }
        if (isTxCompletedRange) {
            setActiveStep(4);
        }
    }, [
        transactionApprovedInit,
        isTxCompletedInit,
        transactionApprovedRange,
        isTxCompletedRange,
    ]);

    const isError = isTransactionDenied || isTransactionException;
    const errorMessage = isError
        ? isTransactionDenied
            ? 'Transaction denied in wallet.'
            : isTransactionException
            ? 'Pool initialization transaction failed simulation. Please refresh and try again.'
            : ''
        : '';

    if (!isConfirmed) return poolTokenDisplay;
    return (
        <Wrapper>
            <StepperComponent
                orientation='vertical'
                steps={steps}
                activeStep={activeStep}
                setActiveStep={setActiveStep}
                isError={isError}
                errorDisplay={
                    isError && (
                        <Text
                            fontWeight='300'
                            fontSize='body'
                            color='other-red'
                            align='center'
                        >
                            {errorMessage}
                        </Text>
                    )
                }
                completedDisplay={
                    isError && (
                        <Text
                            fontWeight='300'
                            fontSize='body'
                            color='other-green'
                            align='center'
                        >
                            {`Pool initialization for ${tokenSymbols} completed`}
                        </Text>
                    )
                }
            />
            {isError && (
                <Button title='Try Again' action={handleConfirmed} flat />
            )}
            {activeStep === steps.length && (
                <Button title='View Pool' action={handleNavigation} flat />
            )}
        </Wrapper>
    );
}
