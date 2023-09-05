import styles from './ConfirmRepositionModal.module.css';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';
import RangeStatus from '../../../Global/RangeStatus/RangeStatus';
import SelectedRange from '../../Range/ConfirmRangeModal/SelectedRange/SelectedRange';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import TokenIcon from '../../../Global/TokenIcon/TokenIcon';
import uriToHttp from '../../../../utils/functions/uriToHttp';
import TradeConfirmationSkeleton from '../../TradeModules/TradeConfirmationSkeleton';

interface propsIF {
    position: PositionIF;
    newRepositionTransactionHash: string;
    onSend: () => Promise<void>;
    showConfirmation: boolean;
    resetConfirmation: () => void;
    txErrorCode: string;
    minPriceDisplay: string;
    maxPriceDisplay: string;
    currentBaseQtyDisplayTruncated: string;
    currentQuoteQtyDisplayTruncated: string;
    isAmbient: boolean;
    pinnedMinPriceDisplayTruncatedInBase: string;
    pinnedMinPriceDisplayTruncatedInQuote: string;
    pinnedMaxPriceDisplayTruncatedInBase: string;
    pinnedMaxPriceDisplayTruncatedInQuote: string;
    newBaseQtyDisplay: string;
    newQuoteQtyDisplay: string;
    isTokenABase: boolean;
    isPositionInRange: boolean;
    onClose: () => void;
}

export default function ConfirmRepositionModal(props: propsIF) {
    const {
        isAmbient,
        pinnedMinPriceDisplayTruncatedInBase,
        pinnedMinPriceDisplayTruncatedInQuote,
        pinnedMaxPriceDisplayTruncatedInBase,
        pinnedMaxPriceDisplayTruncatedInQuote,
        onSend,
        showConfirmation,
        newRepositionTransactionHash,
        resetConfirmation,
        txErrorCode,
        currentBaseQtyDisplayTruncated,
        currentQuoteQtyDisplayTruncated,
        newBaseQtyDisplay,
        newQuoteQtyDisplay,
        isTokenABase,
        isPositionInRange,
        onClose,
    } = props;

    const { tokenA, tokenB } = useAppSelector((state) => state.tradeData);
    const baseToken = isTokenABase ? tokenA : tokenB;
    const quoteToken = isTokenABase ? tokenB : tokenA;

    const tokenAmountDisplay = (
        <section className={styles.fee_tier_display}>
            <div className={styles.fee_tier_container}>
                <div className={styles.detail_line}>
                    <div>
                        <TokenIcon
                            token={baseToken}
                            src={uriToHttp(baseToken.logoURI)}
                            alt={baseToken.symbol}
                            size='m'
                        />
                        <span>Current {baseToken.symbol} Collateral</span>
                    </div>
                    <span>{currentBaseQtyDisplayTruncated}</span>
                </div>
                <div className={styles.detail_line}>
                    <div>
                        <TokenIcon
                            token={baseToken}
                            src={uriToHttp(baseToken.logoURI)}
                            alt={baseToken.symbol}
                            size='m'
                        />
                        <span> {baseToken.symbol} After Reposition</span>
                    </div>
                    <span>{newBaseQtyDisplay}</span>
                </div>
                <p className={styles.divider} />
                <div className={styles.detail_line}>
                    <div>
                        <TokenIcon
                            token={quoteToken}
                            src={uriToHttp(quoteToken.logoURI)}
                            alt={quoteToken.symbol}
                            size='m'
                        />
                        <span>Current {quoteToken.symbol} Collateral</span>
                    </div>
                    <span>{currentQuoteQtyDisplayTruncated}</span>
                </div>
                <div className={styles.detail_line}>
                    <div>
                        <TokenIcon
                            token={quoteToken}
                            src={uriToHttp(quoteToken.logoURI)}
                            alt={quoteToken.symbol}
                            size='m'
                        />
                        <span>{quoteToken.symbol} After Reposition</span>
                    </div>
                    <span>{newQuoteQtyDisplay}</span>
                </div>
            </div>
        </section>
    );

    const poolTokenDisplay = (
        <>
            <section className={styles.position_display}>
                <div className={styles.token_display}>
                    <div className={styles.tokens}>
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
                    </div>
                    <span className={styles.token_symbol}>
                        {tokenA.symbol}/{tokenB.symbol}
                    </span>
                </div>
                <RangeStatus
                    isInRange={true}
                    isEmpty={false}
                    isAmbient={false}
                />
            </section>
            {tokenAmountDisplay}
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
            type='Reposition'
            tokenA={{ token: tokenA }}
            tokenB={{ token: tokenB }}
            transactionHash={newRepositionTransactionHash}
            txErrorCode={txErrorCode}
            showConfirmation={showConfirmation}
            statusText={
                !showConfirmation
                    ? isPositionInRange
                        ? 'Position Currently In Range'
                        : 'Send Reposition'
                    : 'Repositioning'
            }
            initiate={onSend}
            resetConfirmation={resetConfirmation}
            poolTokenDisplay={poolTokenDisplay}
            onClose={onClose}
        />
    );
}
