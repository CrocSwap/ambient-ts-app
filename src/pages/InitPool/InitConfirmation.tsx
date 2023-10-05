import styled from 'styled-components/macro';
import Button from '../../components/Form/Button';
import { useEffect, useState } from 'react';
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
    baseToken: TokenIF;
    quoteToken: TokenIF;
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
    baseCollateral: string;
    quoteCollateral: string;
    isDenomBase: boolean;
}

export default function InitConfirmation(props: InitConfirmationProps) {
    const {
        sendTx,
        transactionApprovedInit,
        transactionApprovedRange,
        isTransactionDenied,
        isTransactionException,
        baseToken,
        quoteToken,
        isAmbient,
        isTokenABase,
        errorCode,
        isTxCompletedInit,
        handleNavigation,
        isTxCompletedRange,
        pinnedMinPriceDisplayTruncatedInBase,
        pinnedMinPriceDisplayTruncatedInQuote,
        pinnedMaxPriceDisplayTruncatedInBase,
        pinnedMaxPriceDisplayTruncatedInQuote,

        isDenomBase,

        baseCollateral,
        quoteCollateral,
    } = props;
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [activeStep, setActiveStep] = useState(0);

    const tokensInfo = (
        <GridContainer numCols={2} gap={8} height='136px'>
            <FeaturedBox pooled={baseCollateral} token={baseToken} />
            <FeaturedBox pooled={quoteCollateral} token={quoteToken} />
        </GridContainer>
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
            <FlexContainer flexDirection='column' gap={8}>
                {tokensInfo}

                {isAmbient || (
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
                        isDenomBaseLocal={isDenomBase}
                    />
                )}
            </FlexContainer>

            <Button
                flat
                title='SEND TO METAMASK'
                action={handleConfirmed}
                width='350px'
            />
        </FlexContainer>
    );

    function handleConfirmed() {
        setIsConfirmed(true);
        sendTx();
    }

    const steps = [
        { label: 'Sign transaction to initialize pool.' },
        {
            label: `Submitting pool initialization for ${baseToken.symbol} / ${quoteToken.symbol}`,
        },
        { label: 'Sign transaction to minting liquidity' },
        {
            label: `Submitting liquidty for ${baseToken.symbol} / ${quoteToken.symbol}`,
        },
    ];

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
            ? `oh oh there is a problem initiating this pool. ${errorCode}. Please try again.`
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
                            {`Pool initialization for ${baseToken.symbol} / ${quoteToken.symbol} completed`}
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
