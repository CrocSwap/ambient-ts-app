import { BigNumber } from 'ethers';
import { useState, useEffect, useContext } from 'react';
import { IS_LOCAL_ENV } from '../../ambient-utils/constants';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { useProcessOrder } from '../../utils/hooks/useProcessOrder';
import { LimitOrderIF } from '../../ambient-utils/types';

import {
    TransactionError,
    isTransactionReplacedError,
    isTransactionFailedError,
    parseErrorMessage,
} from '../../utils/TransactionError';
import LimitActionInfo from './LimitActionInfo/LimitActionInfo';
import LimitActionSettings from './LimitActionSettings/LimitActionSettings';
import LimitActionTokenHeader from './LimitActionTokenHeader/LimitActionTokenHeader';
import { ChainDataContext } from '../../contexts/ChainDataContext';
import { getFormattedNumber } from '../../ambient-utils/dataLayer';
import ModalHeader from '../Global/ModalHeader/ModalHeader';
import { LimitActionType } from '../Global/Tabs/TableMenu/TableMenuComponents/OrdersMenu';
import Modal from '../Global/Modal/Modal';
import SubmitTransaction from '../Trade/TradeModules/SubmitTransaction/SubmitTransaction';
import Button from '../Form/Button';
import styles from './LimitActionModal.module.css';
import { UserDataContext } from '../../contexts/UserDataContext';
import {
    GAS_DROPS_ESTIMATE_LIMIT_REMOVAL,
    NUM_GWEI_IN_WEI,
    GAS_DROPS_ESTIMATE_LIMIT_CLAIM,
} from '../../ambient-utils/constants/';
import { ReceiptContext } from '../../contexts/ReceiptContext';
import { getPositionHash } from '../../ambient-utils/dataLayer/functions/getPositionHash';

interface propsIF {
    limitOrder: LimitOrderIF;
    type: LimitActionType;
    onClose: () => void;
    isAccountView: boolean;
}

export default function LimitActionModal(props: propsIF) {
    const { limitOrder, type, onClose, isAccountView } = props;
    const { userAddress } = useContext(UserDataContext);
    const {
        crocEnv,
        ethMainnetUsdPrice,
        chainData: { poolIndex },
    } = useContext(CrocEnvContext);

    const {
        addPendingTx,
        addReceipt,
        addTransactionByType,
        addPositionUpdate,
        removePendingTx,
        updateTransactionHash,
    } = useContext(ReceiptContext);

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
        truncatedDisplayPriceDenomByMoneyness,
        isBaseTokenMoneynessGreaterOrEqual,
        initialTokenQty,
        baseTokenAddress,
        quoteTokenAddress,
        fillPercentage,
    } = useProcessOrder(limitOrder, crocEnv, userAddress);

    const { gasPriceInGwei, lastBlockNumber } = useContext(ChainDataContext);

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [newTxHash, setNewTxHash] = useState('');
    const [txErrorCode, setTxErrorCode] = useState('');
    const [txErrorMessage, setTxErrorMessage] = useState('');
    const [txErrorJSON, setTxErrorJSON] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [networkFee, setNetworkFee] = useState<string | undefined>(undefined);

    const [currentLiquidity, setCurrentLiquidity] = useState<
        BigNumber | undefined
    >();

    const resetConfirmation = () => {
        setShowConfirmation(false);
        setNewTxHash('');
        setTxErrorCode('');
        setTxErrorJSON('');
        setTxErrorMessage('');
    };

    useEffect(() => {
        if (!showConfirmation) {
            resetConfirmation();
        }
    }, [txErrorCode]);

    const closeModal = () => {
        resetConfirmation();
        onClose();
    };

    const updateLiq = async () => {
        try {
            if (!crocEnv || !limitOrder) return;
            // const pos = new CrocPositionView(pool, limitOrder.user);
            const pos = crocEnv.positions(
                limitOrder.base,
                limitOrder.quote,
                limitOrder.user,
            );

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

    const averageGasUnitsForHarvestTxInGasDrops =
        type === 'Remove'
            ? GAS_DROPS_ESTIMATE_LIMIT_REMOVAL
            : GAS_DROPS_ESTIMATE_LIMIT_CLAIM;

    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const gasPriceInDollarsNum =
                gasPriceInGwei *
                averageGasUnitsForHarvestTxInGasDrops *
                NUM_GWEI_IN_WEI *
                ethMainnetUsdPrice;

            setNetworkFee(
                getFormattedNumber({
                    value: gasPriceInDollarsNum,
                    isUSD: true,
                }),
            );
        }
    }, [gasPriceInGwei, ethMainnetUsdPrice]);

    const posHash = getPositionHash(undefined, {
        isPositionTypeAmbient: false,
        user: userAddress ?? '',
        baseAddress: limitOrder.base,
        quoteAddress: limitOrder.quote,
        poolIdx: poolIndex,
        bidTick: limitOrder.bidTick,
        askTick: limitOrder.askTick,
    });

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
                    addPendingTx(tx?.hash);
                    if (tx?.hash) {
                        addTransactionByType({
                            userAddress: userAddress || '',
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
                                quoteTokenDecimals: limitOrder.quoteDecimals,
                                lowTick: limitOrder.bidTick,
                                highTick: limitOrder.askTick,
                                isBid: limitOrder.isBid,
                            },
                        });
                        addPositionUpdate({
                            txHash: tx.hash,
                            positionID: posHash,
                            isLimit: true,
                            unixTimeAdded: Math.floor(Date.now() / 1000),
                        });
                    }
                } else {
                    tx = await crocEnv
                        .buy(limitOrder.base, 0)
                        .atLimit(limitOrder.quote, limitOrder.askTick)
                        .burnLiq(currentLiquidity);
                    setNewTxHash(tx.hash);
                    addPendingTx(tx?.hash);
                    if (tx?.hash) {
                        addTransactionByType({
                            userAddress: userAddress || '',
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
                                quoteTokenDecimals: limitOrder.quoteDecimals,
                                lowTick: limitOrder.bidTick,
                                highTick: limitOrder.askTick,
                                isBid: limitOrder.isBid,
                            },
                        });
                        addPositionUpdate({
                            txHash: tx.hash,
                            positionID: posHash,
                            isLimit: true,
                            unixTimeAdded: Math.floor(Date.now() / 1000),
                        });
                    }
                }
            } catch (error) {
                console.error({ error });
                setTxErrorCode(error?.code);
                setTxErrorMessage(parseErrorMessage(error));
                setTxErrorJSON(JSON.stringify(error));
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
                    removePendingTx(error.hash);
                    const newTransactionHash = error.replacement.hash;
                    addPendingTx(newTransactionHash);
                    addPositionUpdate({
                        txHash: newTransactionHash,
                        positionID: posHash,
                        isLimit: true,
                        unixTimeAdded: Math.floor(Date.now() / 1000),
                    });
                    updateTransactionHash(error.hash, error.replacement.hash);
                    setNewTxHash(newTransactionHash);
                    IS_LOCAL_ENV && { newTransactionHash };
                    receipt = error.receipt;
                } else if (isTransactionFailedError(error)) {
                    console.error({ error });
                    receipt = error.receipt;
                }
            }

            if (receipt) {
                addReceipt(JSON.stringify(receipt));
                removePendingTx(receipt.transactionHash);
                if (receipt.status === 1) {
                    // track removals separately to identify limit mints that were subsequently removed
                    addPositionUpdate({
                        positionID: posHash,
                        isLimit: true,
                        isFullRemoval: true,
                        txHash: receipt.transactionHash,
                        unixTimeReceipt: Math.floor(Date.now() / 1000),
                    });
                }
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
                    addPendingTx(tx?.hash);
                    if (tx?.hash) {
                        addTransactionByType({
                            userAddress: userAddress || '',
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
                                quoteTokenDecimals: limitOrder.quoteDecimals,
                                lowTick: limitOrder.bidTick,
                                highTick: limitOrder.askTick,
                                isBid: limitOrder.isBid,
                            },
                        });
                        addPositionUpdate({
                            txHash: tx.hash,
                            positionID: posHash,
                            isLimit: true,
                            unixTimeAdded: Math.floor(Date.now() / 1000),
                        });
                    }
                } else {
                    tx = await crocEnv
                        .buy(limitOrder.base, 0)
                        .atLimit(limitOrder.quote, limitOrder.askTick)
                        .recoverPost(claimablePivotTime, { surplus: false });
                    setNewTxHash(tx.hash);
                    addPendingTx(tx?.hash);
                    if (tx?.hash) {
                        addTransactionByType({
                            userAddress: userAddress || '',
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
                                quoteTokenDecimals: limitOrder.quoteDecimals,
                                lowTick: limitOrder.bidTick,
                                highTick: limitOrder.askTick,
                                isBid: limitOrder.isBid,
                            },
                        });
                        addPositionUpdate({
                            txHash: tx.hash,
                            positionID: posHash,
                            isLimit: true,
                            unixTimeAdded: Math.floor(Date.now() / 1000),
                        });
                    }
                }
            } catch (error) {
                console.error({ error });
                setTxErrorCode(error?.code);
                setTxErrorMessage(parseErrorMessage(error));
                setTxErrorJSON(JSON.stringify(error));
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
                    removePendingTx(error.hash);
                    const newTransactionHash = error.replacement.hash;
                    addPendingTx(newTransactionHash);
                    addPositionUpdate({
                        txHash: newTransactionHash,
                        positionID: posHash,
                        isLimit: true,
                        unixTimeAdded: Math.floor(Date.now() / 1000),
                    });
                    updateTransactionHash(error.hash, error.replacement.hash);
                    setNewTxHash(newTransactionHash);
                    IS_LOCAL_ENV && console.debug({ newTransactionHash });
                    receipt = error.receipt;
                } else if (isTransactionFailedError(error)) {
                    console.error({ error });
                    receipt = error.receipt;
                }
            }

            if (receipt) {
                addReceipt(JSON.stringify(receipt));
                removePendingTx(receipt.transactionHash);
                if (receipt.status === 1) {
                    // track claims separately to identify limit mints that were subsequently removed
                    addPositionUpdate({
                        positionID: posHash,
                        isLimit: true,
                        isFullRemoval: true,
                        txHash: receipt.transactionHash,
                        unixTimeReceipt: Math.floor(Date.now() / 1000),
                    });
                }
            }
        }
    };

    const limitInfoProps =
        type === 'Remove'
            ? {
                  type,
                  usdValue,
                  tokenQuantity: limitOrder.isBid ? baseDisplay : quoteDisplay,
                  tokenQuantityAddress: limitOrder.isBid
                      ? baseTokenAddress
                      : quoteTokenAddress,
                  limitOrderPrice: isAccountView
                      ? truncatedDisplayPriceDenomByMoneyness
                      : truncatedDisplayPrice,
                  limitOrderPriceAddress: isAccountView
                      ? isBaseTokenMoneynessGreaterOrEqual
                          ? baseTokenAddress
                          : quoteTokenAddress
                      : !isDenomBase
                      ? baseTokenAddress
                      : quoteTokenAddress,
                  receivingAmount: limitOrder.isBid
                      ? baseDisplay
                      : quoteDisplay,
                  receivingAmountAddress: limitOrder.isBid
                      ? baseTokenAddress
                      : quoteTokenAddress,
                  claimableAmount: limitOrder.isBid
                      ? quoteDisplay
                      : baseDisplay,
                  claimableAmountAddress: limitOrder.isBid
                      ? quoteTokenAddress
                      : baseTokenAddress,
                  networkFee,
              }
            : {
                  type,
                  usdValue,
                  tokenQuantity: initialTokenQty,
                  tokenQuantityAddress: limitOrder.isBid
                      ? baseTokenAddress
                      : quoteTokenAddress,
                  limitOrderPrice: isAccountView
                      ? truncatedDisplayPriceDenomByMoneyness
                      : truncatedDisplayPrice,
                  limitOrderPriceAddress: isAccountView
                      ? isBaseTokenMoneynessGreaterOrEqual
                          ? baseTokenAddress
                          : quoteTokenAddress
                      : !isDenomBase
                      ? baseTokenAddress
                      : quoteTokenAddress,
                  receivingAmount: limitOrder.isBid
                      ? quoteDisplay
                      : baseDisplay,
                  receivingAmountAddress: limitOrder.isBid
                      ? quoteTokenAddress
                      : baseTokenAddress,
                  networkFee,
              };

    return showSettings ? (
        <LimitActionSettings
            showSettings={showSettings}
            setShowSettings={setShowSettings}
            onBackClick={resetConfirmation}
        />
    ) : (
        <Modal usingCustomHeader onClose={closeModal}>
            <ModalHeader title={`${type} Limit Order`} onClose={closeModal} />
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
                            type={type === 'Remove' ? 'Remove' : 'Claim'}
                            newTransactionHash={newTxHash}
                            txErrorCode={txErrorCode}
                            txErrorMessage={txErrorMessage}
                            txErrorJSON={txErrorJSON}
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
                            idForDOM='claim_remove_limit_button'
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
