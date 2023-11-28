// START: Import React and Dongles
import { Dispatch, SetStateAction, memo, useContext, useState } from 'react';

// START: Import JSX Functional Components
import RangeStatus from '../../../Global/RangeStatus/RangeStatus';
import SelectedRange from './SelectedRange/SelectedRange';

// START: Import Local Files
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import TokenIcon from '../../../Global/TokenIcon/TokenIcon';
import uriToHttp from '../../../../utils/functions/uriToHttp';
import TradeConfirmationSkeleton from '../../TradeModules/TradeConfirmationSkeleton';
import { FlexContainer, GridContainer, Text } from '../../../../styled/Common';
import { FeeTierDisplay } from '../../../../styled/Components/TradeModules';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';

interface propsIF {
    sendTransaction: () => Promise<void>;
    newRangeTransactionHash: string;
    spotPriceDisplay: string;
    maxPriceDisplay: string;
    minPriceDisplay: string;
    isTokenABase: boolean;
    isAmbient: boolean;
    isInRange: boolean;
    pinnedMinPriceDisplayTruncatedInBase: string;
    pinnedMinPriceDisplayTruncatedInQuote: string;
    pinnedMaxPriceDisplayTruncatedInBase: string;
    pinnedMaxPriceDisplayTruncatedInQuote: string;
    setShowConfirmation: Dispatch<SetStateAction<boolean>>;
    showConfirmation: boolean;
    txErrorCode: string;
    txErrorMessage: string;
    resetConfirmation: () => void;
    isAdd: boolean;
    tokenAQty: string;
    tokenBQty: string;
    onClose: () => void;
    activeStep: number;
    setActiveStep: React.Dispatch<React.SetStateAction<number>>;
    steps: {
        label: string;
    }[];
    handleSetActiveContent: (newActiveContent: string) => void;
}

function ConfirmRangeModal(props: propsIF) {
    const {
        sendTransaction,
        newRangeTransactionHash,
        isTokenABase,
        isAmbient,
        isInRange,
        pinnedMinPriceDisplayTruncatedInBase,
        pinnedMinPriceDisplayTruncatedInQuote,
        pinnedMaxPriceDisplayTruncatedInBase,
        pinnedMaxPriceDisplayTruncatedInQuote,
        txErrorCode,
        txErrorMessage,
        showConfirmation,
        setShowConfirmation,
        resetConfirmation,
        isAdd,
        tokenAQty,
        tokenBQty,
        onClose = () => null,
        activeStep,
        setActiveStep,
        steps,
        handleSetActiveContent,
    } = props;

    const { tokenA, tokenB, isDenomBase } = useContext(TradeDataContext);

    const [isDenomBaseLocalToRangeConfirm, setIsDenomBaseocalToRangeConfirm] =
        useState(isDenomBase);

    const tokenACharacter: string = getUnicodeCharacter(tokenA.symbol);
    const tokenBCharacter: string = getUnicodeCharacter(tokenB.symbol);

    const poolTokenDisplay = (
        <>
            <FlexContainer
                justifyContent='space-between'
                alignItems='center'
                padding='8px 0'
            >
                <FlexContainer alignItems='center' gap={8}>
                    <FlexContainer alignItems='center' gap={8}>
                        <TokenIcon
                            token={tokenA}
                            src={uriToHttp(tokenA.logoURI)}
                            alt={tokenA.symbol}
                            size='2xl'
                        />
                        <TokenIcon
                            token={tokenB}
                            src={uriToHttp(tokenB.logoURI)}
                            alt={tokenB.symbol}
                            size='2xl'
                        />
                    </FlexContainer>
                    <Text fontSize='header2' color='text1'>
                        {tokenA.symbol}/{tokenB.symbol}
                    </Text>
                </FlexContainer>
                <RangeStatus
                    isInRange={isInRange}
                    isEmpty={false}
                    isAmbient={isAmbient}
                />
            </FlexContainer>
            <FeeTierDisplay>
                <GridContainer gap={12}>
                    <FlexContainer justifyContent='space-between'>
                        <FlexContainer alignItems='center' gap={8}>
                            <TokenIcon
                                token={tokenA}
                                src={uriToHttp(tokenA.logoURI)}
                                alt={tokenA.symbol}
                                size='m'
                            />
                            <Text fontSize='body'>{tokenA.symbol}</Text>
                        </FlexContainer>
                        <Text fontSize='body'>
                            {tokenAQty !== ''
                                ? tokenACharacter + tokenAQty
                                : '0'}
                        </Text>
                    </FlexContainer>
                    <FlexContainer justifyContent='space-between'>
                        <FlexContainer alignItems='center' gap={8}>
                            <TokenIcon
                                token={tokenB}
                                src={uriToHttp(tokenB.logoURI)}
                                alt={tokenB.symbol}
                                size='m'
                            />
                            <Text fontSize='body'>{tokenB.symbol}</Text>
                        </FlexContainer>
                        <Text fontSize='body'>
                            {tokenBQty ? tokenBCharacter + tokenBQty : '0'}
                        </Text>
                    </FlexContainer>
                </GridContainer>
            </FeeTierDisplay>
            {isAmbient || (
                <SelectedRange
                    isDenomBase={isDenomBaseLocalToRangeConfirm}
                    setIsDenomBase={setIsDenomBaseocalToRangeConfirm}
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
                />
            )}
        </>
    );
    console.log({ showConfirmation }, 'From ConfirmRangeModal.tsx');

    return (
        <TradeConfirmationSkeleton
            type='Range'
            tokenA={{ token: tokenA, quantity: tokenAQty }}
            tokenB={{ token: tokenB, quantity: tokenBQty }}
            transactionHash={newRangeTransactionHash}
            txErrorCode={txErrorCode}
            txErrorMessage={txErrorMessage}
            showConfirmation={showConfirmation}
            setShowConfirmation={setShowConfirmation}
            poolTokenDisplay={poolTokenDisplay}
            statusText={
                !showConfirmation
                    ? isAdd
                        ? `Add ${isAmbient ? 'Ambient' : ''} Liquidity`
                        : `Submit ${isAmbient ? 'Ambient' : ''} Liquidity`
                    : `Minting a Position with ${tokenAQty ? tokenAQty : '0'} ${
                          tokenA.symbol
                      } and ${tokenBQty ? tokenBQty : '0'} ${tokenB.symbol}`
            }
            initiate={sendTransaction}
            resetConfirmation={resetConfirmation}
            onClose={onClose}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            steps={steps}
            handleSetActiveContent={handleSetActiveContent}
        />
    );
}

export default memo(ConfirmRangeModal);
