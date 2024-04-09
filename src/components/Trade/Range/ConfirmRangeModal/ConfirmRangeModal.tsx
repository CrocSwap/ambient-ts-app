// START: Import React and Dongles
import { memo, useContext, useEffect, useState } from 'react';

// START: Import JSX Functional Components
import RangeStatus from '../../../Global/RangeStatus/RangeStatus';
import SelectedRange from './SelectedRange/SelectedRange';

// START: Import Local Files
import TokenIcon from '../../../Global/TokenIcon/TokenIcon';
import {
    uriToHttp,
    getUnicodeCharacter,
} from '../../../../ambient-utils/dataLayer';
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
    showConfirmation: boolean;
    txErrorCode: string;
    txErrorMessage: string;
    txErrorJSON: string;
    resetConfirmation: () => void;
    isAdd: boolean;
    tokenAQty: string;
    tokenBQty: string;
    onClose: () => void;
    slippageTolerance: number;
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
        txErrorJSON,
        showConfirmation,
        resetConfirmation,
        isAdd,
        tokenAQty,
        tokenBQty,
        onClose = () => null,
        slippageTolerance,
    } = props;

    const { tokenA, tokenB, isDenomBase } = useContext(TradeDataContext);

    const [isDenomBaseLocalToRangeConfirm, setIsDenomBaseocalToRangeConfirm] =
        useState(isDenomBase);

    const tokenACharacter: string = getUnicodeCharacter(tokenA.symbol);
    const tokenBCharacter: string = getUnicodeCharacter(tokenB.symbol);

    // logic to prevent pool quantities updating during/after pool completion
    const [memoTokenAQty, setMemoTokenAQty] = useState<string | undefined>();
    const [memoTokenBQty, setMemoTokenBQty] = useState<string | undefined>();
    const [memoMinPriceBase, setMemoMinPriceBase] = useState<
        string | undefined
    >();
    const [memoMinPriceQuote, setMemoMinPriceQuote] = useState<
        string | undefined
    >();
    const [memoMaxPriceBase, setMemoMaxPriceBase] = useState<
        string | undefined
    >();
    const [memoMaxPriceQuote, setMemoMaxPriceQuote] = useState<
        string | undefined
    >();
    const [memoIsAdd, setMemoIsAdd] = useState<boolean>(isAdd);

    useEffect(() => {
        if (showConfirmation === false) {
            setMemoTokenAQty(tokenAQty);
            setMemoTokenBQty(tokenBQty);
            setMemoMinPriceBase(pinnedMinPriceDisplayTruncatedInBase);
            setMemoMinPriceQuote(pinnedMinPriceDisplayTruncatedInQuote);
            setMemoMaxPriceBase(pinnedMaxPriceDisplayTruncatedInBase);
            setMemoMaxPriceQuote(pinnedMaxPriceDisplayTruncatedInQuote);
            setMemoIsAdd(isAdd);
        }
    }, [
        showConfirmation,
        tokenAQty,
        tokenBQty,
        pinnedMinPriceDisplayTruncatedInBase,
        pinnedMinPriceDisplayTruncatedInQuote,
        pinnedMaxPriceDisplayTruncatedInBase,
        pinnedMaxPriceDisplayTruncatedInQuote,
        isAdd,
    ]);

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
                            {memoTokenAQty !== ''
                                ? tokenACharacter + memoTokenAQty
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
                            {memoTokenBQty
                                ? tokenBCharacter + memoTokenBQty
                                : '0'}
                        </Text>
                    </FlexContainer>
                </GridContainer>
            </FeeTierDisplay>

            {
                <SelectedRange
                    isDenomBase={isDenomBaseLocalToRangeConfirm}
                    setIsDenomBase={setIsDenomBaseocalToRangeConfirm}
                    isTokenABase={isTokenABase}
                    isAmbient={isAmbient}
                    pinnedMinPriceDisplayTruncatedInBase={memoMinPriceBase}
                    pinnedMinPriceDisplayTruncatedInQuote={memoMinPriceQuote}
                    pinnedMaxPriceDisplayTruncatedInBase={memoMaxPriceBase}
                    pinnedMaxPriceDisplayTruncatedInQuote={memoMaxPriceQuote}
                    slippageTolerance={slippageTolerance}
                />
            }
        </>
    );

    return (
        <TradeConfirmationSkeleton
            type='Range'
            tokenA={{ token: tokenA, quantity: memoTokenAQty }}
            tokenB={{ token: tokenB, quantity: memoTokenBQty }}
            transactionHash={newRangeTransactionHash}
            txErrorCode={txErrorCode}
            txErrorMessage={txErrorMessage}
            txErrorJSON={txErrorJSON}
            showConfirmation={showConfirmation}
            poolTokenDisplay={poolTokenDisplay}
            statusText={
                !showConfirmation
                    ? memoIsAdd
                        ? `Add ${isAmbient ? 'Ambient' : ''} Liquidity`
                        : `Submit ${isAmbient ? 'Ambient' : ''} Liquidity`
                    : memoIsAdd
                    ? `Adding ${memoTokenAQty ? memoTokenAQty : '0'} ${
                          tokenA.symbol
                      } and ${memoTokenBQty ? memoTokenBQty : '0'} ${
                          tokenB.symbol
                      }`
                    : `Minting a Position with ${
                          memoTokenAQty ? memoTokenAQty : '0'
                      } ${tokenA.symbol} and ${
                          memoTokenBQty ? memoTokenBQty : '0'
                      } ${tokenB.symbol}`
            }
            initiate={sendTransaction}
            resetConfirmation={resetConfirmation}
            onClose={onClose}
        />
    );
}

export default memo(ConfirmRangeModal);
