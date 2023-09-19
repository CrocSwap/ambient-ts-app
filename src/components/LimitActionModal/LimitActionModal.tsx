import { BigNumber } from 'ethers';
import { useState, useEffect, useContext } from 'react';
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
    updateTransactionHash,
} from '../../utils/state/receiptDataSlice';
import {
    TransactionError,
    isTransactionReplacedError,
    isTransactionFailedError,
} from '../../utils/TransactionError';
import LimitActionInfo from './LimitActionInfo/LimitActionInfo';
import LimitActionSettings from './LimitActionSettings/LimitActionSettings';
import LimitActionTokenHeader from './LimitActionTokenHeader/LimitActionTokenHeader';
import { ChainDataContext } from '../../contexts/ChainDataContext';
import { getFormattedNumber } from '../../App/functions/getFormattedNumber';
import { CrocPositionView } from '@crocswap-libs/sdk';
import ModalHeader from '../Global/ModalHeader/ModalHeader';
import { LimitActionType } from '../Global/Tabs/TableMenu/TableMenuComponents/OrdersMenu';
import Modal from '../Global/Modal/Modal';
import SubmitTransaction from '../Trade/TradeModules/SubmitTransaction/SubmitTransaction';
import Button from '../Form/Button';
import styles from './LimitActionModal.module.css';

interface propsIF {
    limitOrder: LimitOrderIF;
    type: LimitActionType;
    isOpen: boolean;
    onClose: () => void;
}

export default function LimitActionModal(props: propsIF) {
    const { limitOrder, type, isOpen, onClose } = props;
    const { addressCurrent: userAddress } = useAppSelector(
        (state) => state.userData,
    );
    const {
        baseTokenSymbol,
        quoteTokenSymbol,
        isOrderFilled,
        isLimitOrderPartiallyFilled,
        isDenomBase,
        baseTokenLogo,
        quoteTokenLogo,
        usdValue,
        baseDisplay,
        quoteDisplay,
        truncatedDisplayPrice,
        initialTokenQty,
        baseTokenAddress,
        quoteTokenAddress,
        fillPercentage,
    } = useProcessOrder(limitOrder, userAddress);

    const {
        crocEnv,
        ethMainnetUsdPrice,
        chainData: { poolIndex },
    } = useContext(CrocEnvContext);

    const { gasPriceInGwei, lastBlockNumber } = useContext(ChainDataContext);

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [newTxHash, setNewTxHash] = useState('');
    const [txErrorCode, setTxErrorCode] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [networkFee, setNetworkFee] = useState<string | undefined>(undefined);

    const [currentLiquidity, setCurrentLiquidity] = useState<
        BigNumber | undefined
    >();

    const resetConfirmation = () => {
        setShowConfirmation(false);
        setNewTxHash('');
        setTxErrorCode('');
    };

    useEffect(() => {
        if (!showConfirmation || !isOpen) {
            resetConfirmation();
        }
    }, [txErrorCode, isOpen]);

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

    const averageGasUnitsForHarvestTxInGasDrops =
        type === 'Remove' ? 90069 : 68309;
    const numGweiInWei = 1e-9;

    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const gasPriceInDollarsNum =
                gasPriceInGwei *
                averageGasUnitsForHarvestTxInGasDrops *
                numGweiInWei *
                ethMainnetUsdPrice;

            setNetworkFee(
                getFormattedNumber({
                    value: gasPriceInDollarsNum,
                    isUSD: true,
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
                                txAction: 'Remove',
                                txType: 'Limit',
                                txDescription: `Remove ${limitOrder.baseSymbol}→${limitOrder.quoteSymbol} Limit`,
                                txDetails: {
                                    baseAddress: limitOrder.base,
                                    quoteAddress: limitOrder.quote,
                                    poolIdx: poolIndex,
                                    baseSymbol: limitOrder.baseSymbol,
                                    quoteSymbol: limitOrder.quoteSymbol,
                                    baseTokenDecimals: limitOrder.baseDecimals,
                                    quoteTokenDecimals:
                                        limitOrder.quoteDecimals,
                                    lowTick: limitOrder.bidTick,
                                    highTick: limitOrder.askTick,
                                    isBid: limitOrder.isBid,
                                },
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
                                txAction: 'Remove',
                                txType: 'Limit',
                                txDescription: `Remove ${limitOrder.quoteSymbol}→${limitOrder.baseSymbol} Limit`,
                                txDetails: {
                                    baseAddress: limitOrder.base,
                                    quoteAddress: limitOrder.quote,
                                    poolIdx: poolIndex,
                                    baseSymbol: limitOrder.baseSymbol,
                                    quoteSymbol: limitOrder.quoteSymbol,
                                    baseTokenDecimals: limitOrder.baseDecimals,
                                    quoteTokenDecimals:
                                        limitOrder.quoteDecimals,
                                    lowTick: limitOrder.bidTick,
                                    highTick: limitOrder.askTick,
                                    isBid: limitOrder.isBid,
                                },
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
                    dispatch(
                        updateTransactionHash({
                            oldHash: error.hash,
                            newHash: error.replacement.hash,
                        }),
                    );
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
                                txAction: 'Claim',
                                txType: 'Limit',
                                txDescription: `Claim Limit ${limitOrder.baseSymbol}→${limitOrder.quoteSymbol}`,
                                txDetails: {
                                    baseAddress: limitOrder.base,
                                    quoteAddress: limitOrder.quote,
                                    poolIdx: poolIndex,
                                    baseSymbol: limitOrder.baseSymbol,
                                    quoteSymbol: limitOrder.quoteSymbol,
                                    baseTokenDecimals: limitOrder.baseDecimals,
                                    quoteTokenDecimals:
                                        limitOrder.quoteDecimals,
                                    lowTick: limitOrder.bidTick,
                                    highTick: limitOrder.askTick,
                                    isBid: limitOrder.isBid,
                                },
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
                                txAction: 'Claim',
                                txType: 'Limit',
                                txDescription: `Claim Limit ${limitOrder.quoteSymbol}→${limitOrder.baseSymbol}`,
                                txDetails: {
                                    baseAddress: limitOrder.base,
                                    quoteAddress: limitOrder.quote,
                                    poolIdx: poolIndex,
                                    baseSymbol: limitOrder.baseSymbol,
                                    quoteSymbol: limitOrder.quoteSymbol,
                                    baseTokenDecimals: limitOrder.baseDecimals,
                                    quoteTokenDecimals:
                                        limitOrder.quoteDecimals,
                                    lowTick: limitOrder.bidTick,
                                    highTick: limitOrder.askTick,
                                    isBid: limitOrder.isBid,
                                },
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
                    dispatch(
                        updateTransactionHash({
                            oldHash: error.hash,
                            newHash: error.replacement.hash,
                        }),
                    );
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

    return showSettings ? (
        <LimitActionSettings
            showSettings={showSettings}
            setShowSettings={setShowSettings}
            onBackClick={resetConfirmation}
        />
    ) : (
        <Modal usingCustomHeader onClose={onClose}>
            <ModalHeader title={`${type} Limit Order`} onClose={onClose} />
            <div className={styles.main_content_container}>
                <LimitActionTokenHeader
                    isDenomBase={isDenomBase}
                    isOrderFilled={isOrderFilled}
                    baseTokenAddress={baseTokenAddress}
                    quoteTokenAddress={quoteTokenAddress}
                    isLimitOrderPartiallyFilled={isLimitOrderPartiallyFilled}
                    baseTokenSymbol={baseTokenSymbol}
                    quoteTokenSymbol={quoteTokenSymbol}
                    baseTokenLogoURI={baseTokenLogo}
                    quoteTokenLogoURI={quoteTokenLogo}
                    fillPercentage={fillPercentage}
                />
                <div className={styles.info_container}>
                    <LimitActionInfo {...limitInfoProps} />
                    {showConfirmation ? (
                        <SubmitTransaction
                            type='Limit'
                            newTransactionHash={newTxHash}
                            txErrorCode={txErrorCode}
                            resetConfirmation={resetConfirmation}
                            sendTransaction={
                                type === 'Remove' ? removeFn : claimFn
                            }
                            transactionPendingDisplayString={
                                'Submitting transaction...'
                            }
                            disableSubmitAgain
                        />
                    ) : (
                        <Button
                            title={
                                !currentLiquidity
                                    ? '...'
                                    : type === 'Remove'
                                    ? 'Remove Limit Order'
                                    : 'Claim Limit Order'
                            }
                            disabled={!currentLiquidity}
                            action={type === 'Remove' ? removeFn : claimFn}
                            flat={true}
                        />
                    )}
                </div>
            </div>
        </Modal>
    );
}
