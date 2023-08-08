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
    isOpen: boolean;
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
        isOpen = false,
        onClose = () => null,
    } = props;

    const { tokenA, tokenB } = useAppSelector((state) => state.tradeData);

    const tokenACharacter: string = getUnicodeCharacter(tokenA.symbol);
    const tokenBCharacter: string = getUnicodeCharacter(tokenB.symbol);

    const poolTokenDisplay = (
        <>
            <section className={styles.position_display}>
                <div className={styles.token_display}>
                    <div className={styles.tokens}>
                        <TokenIcon
                            src={uriToHttp(tokenA.logoURI)}
                            alt={tokenA.symbol}
                            size='2xl'
                        />
                        <TokenIcon
                            src={uriToHttp(tokenB.logoURI)}
                            alt={tokenB.symbol}
                            size='2xl'
                        />
                    </div>
                    <span className={styles.token_symbol}>
                        {tokenA.symbol}/{tokenB.symbol}
                    </span>
                </div>
                <RangeStatus
                    isInRange={isInRange}
                    isEmpty={false}
                    isAmbient={isAmbient}
                />
            </section>
            <section className={styles.fee_tier_display}>
                <div className={styles.fee_tier_container}>
                    <div className={styles.detail_line}>
                        <div>
                            <TokenIcon
                                src={uriToHttp(tokenA.logoURI)}
                                alt={tokenA.symbol}
                                size='m'
                            />
                            <span>{tokenA.symbol}</span>
                        </div>
                        <span>
                            {tokenAQty !== ''
                                ? tokenACharacter + tokenAQty
                                : '0'}
                        </span>
                    </div>
                    <div className={styles.detail_line}>
                        <div>
                            <TokenIcon
                                src={uriToHttp(tokenB.logoURI)}
                                alt={tokenB.symbol}
                                size='m'
                            />
                            <span>{tokenB.symbol}</span>
                        </div>
                        <span>
                            {tokenBQty ? tokenBCharacter + tokenBQty : '0'}
                        </span>
                    </div>
                </div>
            </section>
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
            isOpen={isOpen}
            onClose={onClose}
        />
    );
}

export default memo(ConfirmRangeModal);
