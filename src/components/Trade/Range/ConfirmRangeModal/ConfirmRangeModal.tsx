// START: Import React and Dongles
import { memo } from 'react';

// START: Import JSX Functional Components
import RangeStatus from '../../../Global/RangeStatus/RangeStatus';
import SelectedRange from './SelectedRange/SelectedRange';

// START: Import Local Files
import styles from './ConfirmRangeModal.module.css';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import TokenIcon from '../../../Global/TokenIcon/TokenIcon';
import uriToHttp from '../../../../utils/functions/uriToHttp';
import TradeConfirmationSkeleton from '../../TradeModules/TradeConfirmationSkeleton';
import { FlexContainer, GridContainer, Text } from '../../../../styled/Common';
import { FeeTierDisplay } from '../../../../styled/Components/TradeModules';

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
    resetConfirmation: () => void;
    isAdd: boolean;
    tokenAQty: string;
    tokenBQty: string;
    onClose: () => void;
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
        showConfirmation,
        resetConfirmation,
        isAdd,
        tokenAQty,
        tokenBQty,
        onClose = () => null,
    } = props;

    const { tokenA, tokenB } = useAppSelector((state) => state.tradeData);

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

    return (
        <TradeConfirmationSkeleton
            type='Range'
            tokenA={{ token: tokenA, quantity: tokenAQty }}
            tokenB={{ token: tokenB, quantity: tokenBQty }}
            transactionHash={newRangeTransactionHash}
            txErrorCode={txErrorCode}
            showConfirmation={showConfirmation}
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
        />
    );
}

export default memo(ConfirmRangeModal);
