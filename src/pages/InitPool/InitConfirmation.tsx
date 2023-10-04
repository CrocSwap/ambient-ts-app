import styled from 'styled-components/macro';
import Button from '../../components/Form/Button';
import { useEffect, useState } from 'react';
import StepperComponent from '../../components/Global/MultiStepTransaction/StepperComponent';
import SelectedRange from '../../components/Trade/Range/ConfirmRangeModal/SelectedRange/SelectedRange';
import { FlexContainer, GridContainer, Text } from '../../styled/Common';
import TokenIcon from '../../components/Global/TokenIcon/TokenIcon';
import { FeeTierDisplay } from '../../styled/Components/TradeModules';
import uriToHttp from '../../utils/functions/uriToHttp';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import getUnicodeCharacter from '../../utils/functions/getUnicodeCharacter';

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
        baseCollateral,
        quoteCollateral,
        isDenomBase,
    } = props;
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [activeStep, setActiveStep] = useState(0);

    const baseTokenQty = baseCollateral;
    const quoteTokenQty = quoteCollateral;

    const baseTokenCharacter: string = getUnicodeCharacter(baseToken.symbol);
    const quoteTokenCharacter: string = getUnicodeCharacter(quoteToken.symbol);

    const poolTokenDisplay = (
        <FlexContainer
            flexDirection='column'
            justifyContent='space-between'
            alignItems='center'
            style={{
                margin: '0 auto',
                height: '100%',
                paddingTop: '32px',
            }}
        >
            <div>
                <FeeTierDisplay>
                    <GridContainer gap={12}>
                        <FlexContainer justifyContent='space-between'>
                            <FlexContainer alignItems='center' gap={8}>
                                <TokenIcon
                                    token={baseToken}
                                    src={uriToHttp(baseToken.logoURI)}
                                    alt={baseToken.symbol}
                                    size='m'
                                />
                                <Text fontSize='body'>
                                    {' '}
                                    Pooled {baseToken.symbol}
                                </Text>
                            </FlexContainer>
                            <Text fontSize='body'>
                                {baseTokenQty !== ''
                                    ? baseTokenCharacter + baseTokenQty
                                    : '0'}
                            </Text>
                        </FlexContainer>
                        <FlexContainer justifyContent='space-between'>
                            <FlexContainer alignItems='center' gap={8}>
                                <TokenIcon
                                    token={quoteToken}
                                    src={uriToHttp(quoteToken.logoURI)}
                                    alt={quoteToken.symbol}
                                    size='m'
                                />
                                <Text fontSize='body'>
                                    {' '}
                                    Pooled {quoteToken.symbol}
                                </Text>
                            </FlexContainer>
                            <Text fontSize='body'>
                                {quoteTokenQty
                                    ? quoteTokenCharacter + quoteTokenQty
                                    : '0'}
                            </Text>
                        </FlexContainer>
                    </GridContainer>
                </FeeTierDisplay>
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
            </div>
            <Button flat title='SEND TO METAMASK' action={handleConfirmed} />
        </FlexContainer>
    );

    // console.log({
    //     transactionApproved,
    //     isTransactionDenied,
    //     isTransactionException,
    // });

    // eslint-disable-next-line

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
