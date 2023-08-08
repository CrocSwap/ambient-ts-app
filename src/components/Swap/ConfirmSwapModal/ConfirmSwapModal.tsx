// START: Import React and Dongles
import { useContext, useEffect, useMemo, useState } from 'react';

// START: Import Other Local Files
import { TokenPairIF } from '../../../utils/interfaces/exports';
import { AiOutlineWarning } from 'react-icons/ai';
import { PoolContext } from '../../../contexts/PoolContext';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { getFormattedNumber } from '../../../App/functions/getFormattedNumber';
import TradeConfirmationSkeleton from '../../Trade/TradeModules/TradeConfirmationSkeleton';
import styles from '../../Trade/TradeModules/TradeConfirmationSkeleton.module.css';
import uriToHttp from '../../../utils/functions/uriToHttp';
import Modal from '../../Global/Modal/Modal';

interface propsIF {
    initiateSwapMethod: () => Promise<void>;
    isDenomBase: boolean;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    newSwapTransactionHash: string;
    tokenPair: TokenPairIF;
    txErrorCode: string;
    showConfirmation: boolean;
    resetConfirmation: () => void;
    slippageTolerancePercentage: number;
    effectivePrice: number;
    isSellTokenBase: boolean;
    sellQtyString: string;
    buyQtyString: string;
    isOpen: boolean;
    onClose?: () => void;
    isTokenAPrimary: boolean;
}

export default function ConfirmSwapModal(props: propsIF) {
    const {
        initiateSwapMethod,
        isDenomBase,
        baseTokenSymbol,
        quoteTokenSymbol,
        newSwapTransactionHash,
        tokenPair,
        txErrorCode,
        resetConfirmation,
        showConfirmation,
        slippageTolerancePercentage,
        effectivePrice,
        isSellTokenBase,
        sellQtyString,
        buyQtyString,
        isOpen = false,
        onClose = () => null,
        isTokenAPrimary,
    } = props;

    const { pool } = useContext(PoolContext);
    const { lastBlockNumber } = useContext(ChainDataContext);

    const sellTokenData = tokenPair.dataTokenA;
    const buyTokenData = tokenPair.dataTokenB;

    const [isDenomBaseLocal, setIsDenomBaseLocal] = useState(isDenomBase);

    const localeSellString = getFormattedNumber({
        value: parseFloat(sellQtyString),
        abbrevThreshold: 1000000000,
    });

    const localeBuyString = getFormattedNumber({
        value: parseFloat(buyQtyString),
        abbrevThreshold: 1000000000,
    });

    const [baselineBlockNumber, setBaselineBlockNumber] =
        useState<number>(lastBlockNumber);

    const [baselineBuyTokenPrice, setBaselineBuyTokenPrice] = useState<
        number | undefined
    >();

    const [currentBuyTokenPrice, setCurrentBuyTokenPrice] = useState<
        number | undefined
    >();

    const [isWaitingForPriceChangeAckt, setIsWaitingForPriceChangeAckt] =
        useState<boolean>(false);

    const setBaselinePriceAsync = async () => {
        if (!pool) return;
        const newBaselinePrice = await pool.displayPrice(baselineBlockNumber);
        const baselineBuyTokenPrice = isSellTokenBase
            ? 1 / newBaselinePrice
            : newBaselinePrice;
        setBaselineBuyTokenPrice(baselineBuyTokenPrice);
    };

    const setCurrentPriceAsync = async () => {
        if (!pool) return;
        const currentBasePrice = await pool.displayPrice(lastBlockNumber);
        const currentBuyTokenPrice = isSellTokenBase
            ? 1 / currentBasePrice
            : currentBasePrice;
        setCurrentBuyTokenPrice(currentBuyTokenPrice);
    };

    useEffect(() => {
        if (!isWaitingForPriceChangeAckt) setBaselinePriceAsync();
    }, [isWaitingForPriceChangeAckt]);

    useEffect(() => {
        setCurrentPriceAsync();
    }, [lastBlockNumber]);

    const buyTokenPriceChangePercentage = useMemo(() => {
        if (!currentBuyTokenPrice || !baselineBuyTokenPrice) return;

        const changePercentage =
            ((currentBuyTokenPrice - baselineBuyTokenPrice) /
                baselineBuyTokenPrice) *
            100;

        if (changePercentage >= 0.01) {
            setIsWaitingForPriceChangeAckt(true);
        } else {
            setIsWaitingForPriceChangeAckt(false);
        }

        return changePercentage;
    }, [currentBuyTokenPrice, baselineBuyTokenPrice]);

    const buyTokenPriceChangeString = buyTokenPriceChangePercentage
        ? buyTokenPriceChangePercentage.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })
        : undefined;

    const isPriceInverted =
        (isDenomBaseLocal && !isSellTokenBase) ||
        (!isDenomBaseLocal && isSellTokenBase);

    const effectivePriceWithDenom = effectivePrice
        ? isPriceInverted
            ? 1 / effectivePrice
            : effectivePrice
        : undefined;

    const priceIncreaseComponent = (
        <div className={` ${styles.warning_box}`}>
            <ul>
                <div>
                    <AiOutlineWarning
                        color='var(--other-red)'
                        size={20}
                        style={{ marginRight: '4px' }}
                    />
                    Price Updated
                </div>
                <p>
                    The price of {buyTokenData.symbol} has increased by{' '}
                    {buyTokenPriceChangeString + '%'}
                </p>
            </ul>
            <button
                onClick={() => {
                    setBaselineBlockNumber(lastBlockNumber);
                    setIsWaitingForPriceChangeAckt(false);
                }}
            >
                Accept
            </button>
        </div>
    );

    const transactionDetails = (
        <>
            {isTokenAPrimary ? (
                <div className={styles.row}>
                    <p>Expected Output</p>
                    <p>
                        {localeBuyString} {buyTokenData.symbol}
                    </p>
                </div>
            ) : (
                <div className={styles.row}>
                    <p>Expected Input</p>
                    <p>
                        {localeSellString} {sellTokenData.symbol}
                    </p>
                </div>
            )}
            <div className={styles.row}>
                <p>Effective Conversion Rate</p>
                <p
                    onClick={() => {
                        setIsDenomBaseLocal(!isDenomBaseLocal);
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    {isDenomBaseLocal
                        ? `${getFormattedNumber({
                              value: effectivePriceWithDenom,
                          })} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                        : `${getFormattedNumber({
                              value: effectivePriceWithDenom,
                          })} ${baseTokenSymbol} per ${quoteTokenSymbol}`}
                </p>
            </div>
            <div className={styles.row}>
                <p>Slippage Tolerance</p>
                <p>{slippageTolerancePercentage}%</p>
            </div>
        </>
    );

    return (
        <TradeConfirmationSkeleton
            isOpen={isOpen}
            onClose={onClose}
            type='Swap'
            tokenA={{ token: sellTokenData, quantity: sellQtyString }}
            tokenB={{ token: buyTokenData, quantity: buyQtyString }}
            transactionDetails={transactionDetails}
            transactionHash={newSwapTransactionHash}
            txErrorCode={txErrorCode}
            showConfirmation={showConfirmation}
            statusText={
                !showConfirmation
                    ? 'Submit Swap'
                    : `Swapping ${localeSellString} ${sellTokenData.symbol} for ${localeBuyString} ${buyTokenData.symbol}`
            }
            initiate={initiateSwapMethod}
            resetConfirmation={resetConfirmation}
            acknowledgeUpdate={
                isWaitingForPriceChangeAckt && priceIncreaseComponent
            }
        />
    );
}
