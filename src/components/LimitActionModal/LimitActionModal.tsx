import { BigNumber } from 'ethers';
import { useState, useEffect, useContext } from 'react';
import styles from './LimitActionModal.module.css';
import { IS_LOCAL_ENV } from '../../constants';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { useAppSelector, useAppDispatch } from '../../utils/hooks/reduxToolkit';
import { useProcessOrder } from '../../utils/hooks/useProcessOrder';
import { LimitOrderIF } from '../../utils/interfaces/LimitOrderIF';
import {
    addPendingTx,
    addTransactionByType,
    removePendingTx,
    addReceipt,
} from '../../utils/state/receiptDataSlice';
import {
    TransactionError,
    isTransactionReplacedError,
    isTransactionFailedError,
} from '../../utils/TransactionError';
import TransactionDenied from '../Global/TransactionDenied/TransactionDenied';
import TransactionException from '../Global/TransactionException/TransactionException';
import TxSubmittedSimplify from '../Global/TransactionSubmitted/TxSubmiitedSimplify';
import WaitingConfirmation from '../Global/WaitingConfirmation/WaitingConfirmation';
import LimitActionButton from './LimitActionButton/LimitActionButton';
import LimitActionHeader from './LimitActionHeader/LimitActionHeader';
import LimitActionInfo from './LimitActionInfo/LimitActionInfo';
import LimitActionSettings from './LimitActionSettings/LimitActionSettings';
import LimitActionTokenHeader from './LimitActionTokenHeader/LimitActionTokenHeader';
import { ChainDataContext } from '../../contexts/ChainDataContext';
import { CrocPositionView } from '@crocswap-libs/sdk';

interface propsIF {
    limitOrder: LimitOrderIF;
    type: 'Remove' | 'Claim';
}

export default function LimitActionModal(props: propsIF) {
    const { limitOrder, type } = props;
    const { addressCurrent: userAddress } = useAppSelector(
        (state) => state.userData,
    );
    const {
        baseTokenSymbol,
        quoteTokenSymbol,
        isOrderFilled,
        isDenomBase,
        baseTokenLogo,
        quoteTokenLogo,
        usdValue,
        baseDisplay,
        quoteDisplay,
        truncatedDisplayPrice,
        initialTokenQty,
    } = useProcessOrder(limitOrder, userAddress);

    const { crocEnv, ethMainnetUsdPrice } = useContext(CrocEnvContext);
    const { gasPriceInGwei } = useContext(ChainDataContext);

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [newTxHash, setNewTxHash] = useState('');
    const [txErrorCode, setTxErrorCode] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [networkFee, setNetworkFee] = useState<string | undefined>(undefined);

    const [currentLiquidity, setCurrentLiquidity] = useState<
        BigNumber | undefined
    >();

    const { lastBlockNumber } = useContext(ChainDataContext);

    const resetConfirmation = () => {
        setShowConfirmation(false);
        setNewTxHash('');
        setTxErrorCode('');
    };

    useEffect(() => {
        if (!showConfirmation) {
            resetConfirmation();
        }
    }, [txErrorCode]);

    const updateLiq = async () => {
        try {
            if (!crocEnv || !limitOrder) return;
            const pool = crocEnv.pool(limitOrder.base, limitOrder.quote);
            const pos = new CrocPositionView(pool, limitOrder.user);

            const liqBigNum = (
                await pos.queryKnockoutLivePos(
                    limitOrder.isBid,
                    limitOrder.bidTick,
                    limitOrder.askTick,
                )
            ).liq;
            setCurrentLiquidity(liqBigNum);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (crocEnv && limitOrder) {
            updateLiq();
        }
    }, [crocEnv, lastBlockNumber, limitOrder?.limitOrderId]);

    const dispatch = useAppDispatch();

    const averageGasUnitsForHarvestTx = type === 'Remove' ? 90069 : 68309;
    const numGweiInWei = 1e-9;

    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const gasPriceInDollarsNum =
                gasPriceInGwei *
                averageGasUnitsForHarvestTx *
                numGweiInWei *
                ethMainnetUsdPrice;

            setNetworkFee(
                '$' +
                    gasPriceInDollarsNum.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }),
            );
        }
    }, [gasPriceInGwei, ethMainnetUsdPrice]);

    const removeFn = async () => {
        if (!currentLiquidity) return;
        if (crocEnv) {
            setShowConfirmation(true);
            setShowSettings(false);
            IS_LOCAL_ENV && { limitOrder };

            let tx;
            try {
                if (limitOrder.isBid) {
                    tx = await crocEnv
                        .buy(limitOrder.quote, 0)
                        .atLimit(limitOrder.base, limitOrder.bidTick)
                        .burnLiq(currentLiquidity);
                    setNewTxHash(tx.hash);
                    dispatch(addPendingTx(tx?.hash));
                    if (tx?.hash)
                        dispatch(
                            addTransactionByType({
                                txHash: tx.hash,
                                txType: `Remove ${limitOrder.baseSymbol}→${limitOrder.quoteSymbol} Limit`,
                            }),
                        );
                } else {
                    tx = await crocEnv
                        .buy(limitOrder.base, 0)
                        .atLimit(limitOrder.quote, limitOrder.askTick)
                        .burnLiq(currentLiquidity);
                    setNewTxHash(tx.hash);
                    dispatch(addPendingTx(tx?.hash));
                    if (tx?.hash)
                        dispatch(
                            addTransactionByType({
                                txHash: tx.hash,
                                txType: `Remove ${limitOrder.quoteSymbol}→${limitOrder.baseSymbol} Limit`,
                            }),
                        );
                }
            } catch (error) {
                console.error({ error });
                setTxErrorCode(error?.code);
                if (
                    error.reason === 'sending a transaction requires a signer'
                ) {
                    location.reload();
                }
            }

            let receipt;
            try {
                if (tx) receipt = await tx.wait();
            } catch (e) {
                const error = e as TransactionError;
                console.error({ error });

                // The user used "speed up" or something similar
                // in their client, but we now have the updated info
                if (isTransactionReplacedError(error)) {
                    IS_LOCAL_ENV && 'repriced';
                    dispatch(removePendingTx(error.hash));
                    const newTransactionHash = error.replacement.hash;
                    dispatch(addPendingTx(newTransactionHash));
                    setNewTxHash(newTransactionHash);
                    IS_LOCAL_ENV && { newTransactionHash };
                    receipt = error.receipt;
                } else if (isTransactionFailedError(error)) {
                    console.error({ error });
                    receipt = error.receipt;
                }
            }

            if (receipt) {
                dispatch(addReceipt(JSON.stringify(receipt)));
                dispatch(removePendingTx(receipt.transactionHash));
            }
        }
    };

    const claimablePivotTime = limitOrder.claimableLiqPivotTimes
        ? limitOrder.claimableLiqPivotTimes
        : undefined;

    const claimFn = async () => {
        if (crocEnv && claimablePivotTime) {
            setShowConfirmation(true);
            setShowSettings(false);
            if (IS_LOCAL_ENV) {
                console.debug({ claimablePivotTime });
                console.debug({ limitOrder });
            }
            let tx;
            try {
                if (limitOrder.isBid) {
                    tx = await crocEnv
                        .buy(limitOrder.quote, 0)
                        .atLimit(limitOrder.base, limitOrder.bidTick)
                        .recoverPost(claimablePivotTime, { surplus: false });
                    setNewTxHash(tx.hash);
                    dispatch(addPendingTx(tx?.hash));
                    if (tx?.hash)
                        dispatch(
                            addTransactionByType({
                                txHash: tx.hash,
                                txType: `Claim Limit ${limitOrder.baseSymbol}→${limitOrder.quoteSymbol}`,
                            }),
                        );
                } else {
                    tx = await crocEnv
                        .buy(limitOrder.base, 0)
                        .atLimit(limitOrder.quote, limitOrder.askTick)
                        .recoverPost(claimablePivotTime, { surplus: false });
                    setNewTxHash(tx.hash);
                    dispatch(addPendingTx(tx?.hash));
                    if (tx?.hash)
                        dispatch(
                            addTransactionByType({
                                txHash: tx.hash,
                                txType: `Claim Limit ${limitOrder.quoteSymbol}→${limitOrder.baseSymbol}`,
                            }),
                        );
                }
            } catch (error) {
                console.error({ error });
                setTxErrorCode(error?.code);
                if (
                    error.reason === 'sending a transaction requires a signer'
                ) {
                    location.reload();
                }
            }

            let receipt;
            try {
                if (tx) receipt = await tx.wait();
            } catch (e) {
                const error = e as TransactionError;
                console.error({ error });
                // The user used "speed up" or something similar
                // in their client, but we now have the updated info
                if (isTransactionReplacedError(error)) {
                    IS_LOCAL_ENV && console.debug('repriced');
                    dispatch(removePendingTx(error.hash));
                    const newTransactionHash = error.replacement.hash;
                    dispatch(addPendingTx(newTransactionHash));
                    setNewTxHash(newTransactionHash);
                    IS_LOCAL_ENV && console.debug({ newTransactionHash });
                    receipt = error.receipt;
                } else if (isTransactionFailedError(error)) {
                    console.error({ error });
                    receipt = error.receipt;
                }
            }

            if (receipt) {
                dispatch(addReceipt(JSON.stringify(receipt)));
                dispatch(removePendingTx(receipt.transactionHash));
            }
        }
    };

    // ----------------------------CONFIRMATION JSX------------------------------

    const transactionSuccess = (
        <TxSubmittedSimplify
            hash={newTxHash}
            content={
                type === 'Remove'
                    ? 'Removal Transaction Successfully Submitted'
                    : 'Claim Transaction Successfully Submitted'
            }
        />
    );

    const transactionPending = (
        <WaitingConfirmation content='Please check your wallet for notifications' />
    );

    const [currentConfirmationData, setCurrentConfirmationData] =
        useState(transactionPending);

    const transactionApproved = newTxHash !== '';
    const isTransactionDenied = txErrorCode === 'ACTION_REJECTED';
    const isTransactionException = txErrorCode !== '' && !isTransactionDenied;

    const transactionException = (
        <TransactionException resetConfirmation={resetConfirmation} />
    );

    function handleConfirmationChange() {
        setCurrentConfirmationData(transactionPending);

        if (transactionApproved) {
            setCurrentConfirmationData(transactionSuccess);
        } else if (isTransactionDenied) {
            setCurrentConfirmationData(
                <TransactionDenied resetConfirmation={resetConfirmation} />,
            );
        } else if (isTransactionException) {
            setCurrentConfirmationData(transactionException);
        }
    }

    const limitInfoProps =
        type === 'Remove'
            ? {
                  type,
                  usdValue,
                  tokenQuantity: limitOrder.isBid ? baseDisplay : quoteDisplay,
                  tokenQuantityLogo: limitOrder.isBid
                      ? baseTokenLogo
                      : quoteTokenLogo,
                  limitOrderPrice: truncatedDisplayPrice,
                  limitOrderPriceLogo: !isDenomBase
                      ? baseTokenLogo
                      : quoteTokenLogo,
                  receivingAmount: limitOrder.isBid
                      ? baseDisplay
                      : quoteDisplay,
                  receivingAmountLogo: limitOrder.isBid
                      ? baseTokenLogo
                      : quoteTokenLogo,
                  networkFee,
              }
            : {
                  type,
                  usdValue,
                  tokenQuantity: initialTokenQty,
                  tokenQuantityLogo: limitOrder.isBid
                      ? baseTokenLogo
                      : quoteTokenLogo,
                  limitOrderPrice: truncatedDisplayPrice,
                  limitOrderPriceLogo: !isDenomBase
                      ? baseTokenLogo
                      : quoteTokenLogo,
                  receivingAmount: !limitOrder.isBid
                      ? baseDisplay
                      : quoteDisplay,
                  receivingAmountLogo: !limitOrder.isBid
                      ? baseTokenLogo
                      : quoteTokenLogo,
                  networkFee,
              };

    useEffect(() => {
        handleConfirmationChange();
    }, [
        transactionApproved,
        newTxHash,
        txErrorCode,
        showConfirmation,
        isTransactionDenied,
    ]);

    const confirmationContent = (
        <>
            <LimitActionHeader
                title={
                    type === 'Remove'
                        ? 'Remove Limit Order Confirmation'
                        : 'Claim Limit Order Confirmation'
                }
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                onGoBack={showSettings ? () => setShowSettings(false) : null}
            />
            <div className={styles.confirmation_container}>
                <div className={styles.confirmation_content}>
                    {currentConfirmationData}
                </div>
            </div>
        </>
    );
    // ----------------------------END OF CONFIRMATION JSX------------------------------

    const showSettingsOrMainContent = showSettings ? (
        <LimitActionSettings
            showSettings={showSettings}
            setShowSettings={setShowSettings}
            onBackClick={resetConfirmation}
        />
    ) : (
        <>
            <LimitActionHeader
                title={
                    showConfirmation
                        ? ''
                        : type === 'Remove'
                        ? 'Remove Limit Order'
                        : 'Claim Limit Order '
                }
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                onGoBack={showSettings ? () => setShowSettings(false) : null}
            />
            <div style={{ padding: '1rem ' }}>
                <LimitActionTokenHeader
                    isDenomBase={isDenomBase}
                    isOrderFilled={isOrderFilled}
                    baseTokenSymbol={baseTokenSymbol}
                    quoteTokenSymbol={quoteTokenSymbol}
                    baseTokenLogoURI={baseTokenLogo}
                    quoteTokenLogoURI={quoteTokenLogo}
                />
                <div style={{ padding: '0 8px' }}>
                    <LimitActionInfo {...limitInfoProps} />
                    <LimitActionButton
                        onClick={type === 'Remove' ? removeFn : claimFn}
                        disabled={currentLiquidity === undefined}
                        title={
                            type === 'Remove'
                                ? 'Remove Limit Order'
                                : 'Claim Limit Order'
                        }
                    />
                </div>
            </div>
        </>
    );

    // --------------------------------------------------------------------------------------

    if (showConfirmation) return confirmationContent;
    return <>{showSettingsOrMainContent}</>;
}
