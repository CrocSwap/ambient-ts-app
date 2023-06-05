import { useState, useEffect, useContext } from 'react';
import { useProcessOrder } from '../../utils/hooks/useProcessOrder';
import RemoveOrderButton from './RemoveOrderButton/RemoveOrderButton';
import RemoveOrderTokenHeader from './RemoveOrderTokenHeader/RemoveOrderTokenHeader';
import RemoveOrderInfo from './RemoveOrderInfo/RemoveOrderInfo';
import RemoveOrderWidth from './RemoveOrderWidth/RemoveOrderWidth';
import styles from './OrderRemoval.module.css';

import RemoveOrderModalHeader from './RemoveOrderModalHeader/RemoveOrderModalHeader';
import RemoveOrderSettings from './RemoveOrderSettings/RemoveOrderSettings';
import { formatAmountOld } from '../../utils/numbers';
import { BigNumber } from 'ethers';
// import Toggle2 from '../Global/Toggle/Toggle2';
// import TooltipComponent from '../Global/TooltipComponent/TooltipComponent';
import { LimitOrderIF } from '../../utils/interfaces/exports';
import { useAppDispatch, useAppSelector } from '../../utils/hooks/reduxToolkit';
import {
    addPendingTx,
    addReceipt,
    addTransactionByType,
    removePendingTx,
} from '../../utils/state/receiptDataSlice';
import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../utils/TransactionError';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import TransactionException from '../Global/TransactionException/TransactionException';
import TxSubmittedSimplify from '../Global/TransactionSubmitted/TxSubmiitedSimplify';
import TransactionDenied from '../Global/TransactionDenied/TransactionDenied';
import WaitingConfirmation from '../Global/WaitingConfirmation/WaitingConfirmation';
import { GRAPHCACHE_URL, IS_LOCAL_ENV } from '../../constants';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';

interface propsIF {
    limitOrder: LimitOrderIF;
}

export default function OrderRemoval(props: propsIF) {
    const { limitOrder } = props;
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
    } = useProcessOrder(limitOrder, userAddress);
    const { crocEnv } = useContext(CrocEnvContext);

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [newRemovalTransactionHash, setNewRemovalTransactionHash] =
        useState('');
    const [txErrorCode, setTxErrorCode] = useState('');
    const [showSettings, setShowSettings] = useState(false);

    const resetConfirmation = () => {
        setShowConfirmation(false);
        setNewRemovalTransactionHash('');
        setTxErrorCode('');
    };

    useEffect(() => {
        if (!showConfirmation) {
            resetConfirmation();
        }
    }, [txErrorCode]);

    const [removalPercentage, setRemovalPercentage] = useState(100);
    const [baseQtyToBeRemoved, setBaseQtyToBeRemoved] = useState<string>('…');
    const [quoteQtyToBeRemoved, setQuoteQtyToBeRemoved] = useState<string>('…');

    const baseQty = limitOrder.positionLiqBaseDecimalCorrected;
    const quoteQty = limitOrder.positionLiqQuoteDecimalCorrected;

    const dispatch = useAppDispatch();

    useEffect(() => {
        const baseRemovalNum = baseQty * (removalPercentage / 100);
        const quoteRemovalNum = quoteQty * (removalPercentage / 100);
        const baseRemovalTruncated =
            baseRemovalNum === undefined
                ? undefined
                : baseRemovalNum === 0
                ? '0.00'
                : baseRemovalNum < 0.0001
                ? baseRemovalNum.toExponential(2)
                : baseRemovalNum < 2
                ? baseRemovalNum.toPrecision(3)
                : baseRemovalNum >= 100000
                ? formatAmountOld(baseRemovalNum)
                : // ? baseLiqDisplayNum.toExponential(2)
                  baseRemovalNum.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  });
        if (baseRemovalTruncated !== undefined)
            setBaseQtyToBeRemoved(baseRemovalTruncated);
        const quoteRemovalTruncated =
            baseRemovalNum === undefined
                ? undefined
                : quoteRemovalNum === 0
                ? '0.00'
                : quoteRemovalNum < 0.0001
                ? quoteRemovalNum.toExponential(2)
                : quoteRemovalNum < 2
                ? quoteRemovalNum.toPrecision(3)
                : quoteRemovalNum >= 100000
                ? formatAmountOld(quoteRemovalNum)
                : quoteRemovalNum.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  });
        if (quoteRemovalTruncated !== undefined)
            setQuoteQtyToBeRemoved(quoteRemovalTruncated);
    }, [removalPercentage]);

    const positionLiquidity = limitOrder.positionLiq;

    const removeFn = async () => {
        if (crocEnv) {
            setShowConfirmation(true);
            setShowSettings(false);
            IS_LOCAL_ENV && { limitOrder };

            const liqToRemove = BigNumber.from(positionLiquidity)
                .mul(removalPercentage)
                .div(100);

            let tx;
            try {
                if (limitOrder.isBid) {
                    tx = await crocEnv
                        .buy(limitOrder.quote, 0)
                        .atLimit(limitOrder.base, limitOrder.bidTick)
                        .burnLiq(liqToRemove);
                    setNewRemovalTransactionHash(tx.hash);
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
                        .burnLiq(liqToRemove);
                    setNewRemovalTransactionHash(tx.hash);
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
                    setNewRemovalTransactionHash(newTransactionHash);
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

    // ----------------------------CONFIRMATION JSX------------------------------

    const removalSuccess = (
        <TxSubmittedSimplify
            hash={newRemovalTransactionHash}
            content='Removal Transaction Successfully Submitted'
        />
    );

    const removalPending = (
        <WaitingConfirmation content='Please check your wallet for notifications' />
    );

    const [currentConfirmationData, setCurrentConfirmationData] =
        useState(removalPending);

    const transactionApproved = newRemovalTransactionHash !== '';
    const isTransactionDenied = txErrorCode === 'ACTION_REJECTED';
    const isTransactionException = txErrorCode !== '' && !isTransactionDenied;

    const transactionException = (
        <TransactionException resetConfirmation={resetConfirmation} />
    );

    function handleConfirmationChange() {
        setCurrentConfirmationData(removalPending);

        if (transactionApproved) {
            setCurrentConfirmationData(removalSuccess);
        } else if (isTransactionDenied) {
            setCurrentConfirmationData(
                <TransactionDenied resetConfirmation={resetConfirmation} />,
            );
        } else if (isTransactionException) {
            setCurrentConfirmationData(transactionException);
        }
    }

    useEffect(() => {
        handleConfirmationChange();
    }, [
        transactionApproved,
        newRemovalTransactionHash,
        txErrorCode,
        showConfirmation,
        isTransactionDenied,
    ]);

    const confirmationContent = (
        <>
            <RemoveOrderModalHeader
                title={'Remove Limit Order Confirmation'}
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

    // ----------------------------- GASLESS TRANSACTION-----------------------

    // const gaslesssTransactionControl = (
    //     <section className={styles.gasless_container}>
    //         <h3>Enable Gasless Transaction</h3>

    //         <Toggle2
    //             isOn={false}
    //             handleToggle={() => console.debug('toggled')}
    //             id='gasless_transaction_toggle_remove_order'
    //             disabled={true}
    //         />
    //     </section>
    // );

    // ----------------------------- END OF GASLESS TRANSACTION-----------------------

    // ---------------------SLIPPAGE TOLERANCE DISPLAY-----------------------------

    // const tooltipExplanationData = [
    //     // {
    //     //     title: 'Slippage Tolerance',
    //     //     tooltipTitle: 'something here',
    //     //     data: '0.5%',
    //     // },
    //     {
    //         title: 'Network Fee',
    //         tooltipTitle: 'something here about network fee',
    //         data: '-$3.69',
    //         // data: isDenomBase
    //         //     ? `${displayLimitPriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
    //         //     : `${displayLimitPriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`,
    //     },
    // ];

    // const tooltipExplanationDataDisplay = (
    //     <div className={styles.explanation_details}>
    //         {tooltipExplanationData.map((item, idx) => (
    //             <div className={styles.extra_row} key={idx}>
    //                 <div className={styles.align_center}>
    //                     <div>{item.title}</div>
    //                     <TooltipComponent title={item.tooltipTitle} />
    //                 </div>
    //                 <div className={styles.data}>{item.data}</div>
    //             </div>
    //         ))}
    //     </div>
    // );

    // ---------------------SLIPPAGE TOLERANCE DISPLAY-----------------------------

    const showSettingsOrMainContent = showSettings ? (
        <RemoveOrderSettings
            showSettings={showSettings}
            setShowSettings={setShowSettings}
            onBackClick={resetConfirmation}
        />
    ) : (
        <>
            <RemoveOrderModalHeader
                title={showConfirmation ? '' : 'Remove Limit Order'}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                onGoBack={showSettings ? () => setShowSettings(false) : null}
            />
            <div style={{ padding: '1rem ' }}>
                <RemoveOrderTokenHeader
                    isDenomBase={isDenomBase}
                    isOrderFilled={isOrderFilled}
                    baseTokenSymbol={baseTokenSymbol}
                    quoteTokenSymbol={quoteTokenSymbol}
                    baseTokenLogoURI={baseTokenLogo}
                    quoteTokenLogoURI={quoteTokenLogo}
                />
                <div style={{ padding: '0 8px' }}>
                    <RemoveOrderWidth
                        removalPercentage={removalPercentage}
                        setRemovalPercentage={setRemovalPercentage}
                    />
                    <RemoveOrderInfo
                        baseTokenLogoURI={baseTokenLogo}
                        quoteTokenLogoURI={quoteTokenLogo}
                        usdValue={usdValue}
                        baseDisplay={baseDisplay}
                        quoteDisplay={quoteDisplay}
                        baseRemovalString={baseQtyToBeRemoved}
                        quoteRemovalString={quoteQtyToBeRemoved}
                    />
                    {/* {gaslesssTransactionControl} */}
                    {/* {tooltipExplanationDataDisplay} */}
                    <RemoveOrderButton
                        removeFn={removeFn}
                        disabled={false}
                        title='Remove Limit Order'
                    />
                </div>
            </div>
        </>
    );

    // --------------------------------------------------------------------------------------

    if (showConfirmation) return confirmationContent;
    return <>{showSettingsOrMainContent}</>;
}
