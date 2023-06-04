import styles from './ClaimOrder.module.css';
import { useState, useEffect, useContext } from 'react';
import { useProcessOrder } from '../../utils/hooks/useProcessOrder';

// import Toggle2 from '../Global/Toggle/Toggle2';
// import TooltipComponent from '../Global/TooltipComponent/TooltipComponent';
import ClaimOrderSettings from './ClaimOrderSettings/ClaimOrderSettings';
import ClaimOrderModalHeader from './ClaimOrderModalHeader/ClaimOrderModalHeader';
import ClaimOrderTokenHeader from './ClaimOrderTokenHeader/ClaimOrderTokenHeader';
import ClaimOrderInfo from './ClaimOrderInfo/ClaimOrderInfo';
import ClaimOrderButton from './ClaimOrderButton/ClaimOrderButton';
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
import TransactionException from '../Global/TransactionException/TransactionException';
import TransactionDenied from '../Global/TransactionDenied/TransactionDenied';
import WaitingConfirmation from '../Global/WaitingConfirmation/WaitingConfirmation';
import TxSubmittedSimplify from '../Global/TransactionSubmitted/TxSubmiitedSimplify';
import { IS_LOCAL_ENV } from '../../constants';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';

interface propsIF {
    limitOrder: LimitOrderIF;
}

export default function ClaimOrder(props: propsIF) {
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
        truncatedDisplayPrice,
    } = useProcessOrder(limitOrder, userAddress);
    const { crocEnv } = useContext(CrocEnvContext);

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [newClaimTransactionHash, setNewClaimTransactionHash] = useState('');
    const [txErrorCode, setTxErrorCode] = useState('');
    const [showSettings, setShowSettings] = useState(false);

    const dispatch = useAppDispatch();

    const resetConfirmation = () => {
        setShowConfirmation(false);
        setNewClaimTransactionHash('');
        setTxErrorCode('');
    };

    useEffect(() => {
        if (!showConfirmation) {
            resetConfirmation();
        }
    }, [txErrorCode]);

    const claimablePivotTime = limitOrder.claimableLiqPivotTimes
        ? parseInt(limitOrder.claimableLiqPivotTimes)
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
                    setNewClaimTransactionHash(tx.hash);
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
                    setNewClaimTransactionHash(tx.hash);
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
                    setNewClaimTransactionHash(newTransactionHash);
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

    const claimSuccess = (
        <TxSubmittedSimplify
            hash={newClaimTransactionHash}
            content='Claim Transaction Successfully Submitted'
        />
    );

    const claimPending = (
        <WaitingConfirmation content='Please check your wallet for notifications' />
    );

    const [currentConfirmationData, setCurrentConfirmationData] =
        useState(claimPending);

    const transactionException = (
        <TransactionException resetConfirmation={resetConfirmation} />
    );

    const transactionApproved = newClaimTransactionHash !== '';
    const isTransactionDenied = txErrorCode === 'ACTION_REJECTED';
    const isTransactionException = txErrorCode !== '' && !isTransactionDenied;

    function handleConfirmationChange() {
        setCurrentConfirmationData(claimPending);

        if (transactionApproved) {
            setCurrentConfirmationData(claimSuccess);
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
        newClaimTransactionHash,
        txErrorCode,
        showConfirmation,
        isTransactionDenied,
    ]);

    const confirmationContent = (
        <>
            <ClaimOrderModalHeader
                title={'Claim Limit Order Confirmation'}
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
    //             id='gasless_transaction_toggle_claim_order'
    //             disabled={true}
    //         />
    //     </section>
    // );

    // ----------------------------- END OF GASLESS TRANSACTION-----------------------

    // ---------------------Explanation data DISPLAY-----------------------------

    // const tooltipExplanationData = [
    //     {
    //         title: 'Network Fee',
    //         tooltipTitle: 'something here about network fee',
    //         data: '$???',
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

    // ---------------------Explanation data DISPLAY-----------------------------

    const showSettingsOrMainContent = showSettings ? (
        <ClaimOrderSettings
            showSettings={showSettings}
            setShowSettings={setShowSettings}
            onBackClick={resetConfirmation}
        />
    ) : (
        <>
            <ClaimOrderModalHeader
                title={'Claim Limit Order '}
                onGoBack={showSettings ? () => setShowSettings(false) : null}
            />
            <div style={{ padding: '1rem' }}>
                <ClaimOrderTokenHeader
                    isDenomBase={isDenomBase}
                    isOrderFilled={isOrderFilled}
                    baseTokenSymbol={baseTokenSymbol}
                    quoteTokenSymbol={quoteTokenSymbol}
                    baseTokenLogoURI={baseTokenLogo}
                    quoteTokenLogoURI={quoteTokenLogo}
                />

                <ClaimOrderInfo
                    pivotTime={claimablePivotTime}
                    baseTokenLogoURI={baseTokenLogo}
                    quoteTokenLogoURI={quoteTokenLogo}
                    usdValue={usdValue}
                    baseDisplay={baseDisplay}
                    quoteDisplay={quoteDisplay}
                    truncatedDisplayPrice={truncatedDisplayPrice}
                />
                {/* {gaslesssTransactionControl} */}
                {/* {tooltipExplanationDataDisplay} */}
                <ClaimOrderButton
                    claimFn={claimFn}
                    disabled={false}
                    title='Claim Limit Order'
                />
            </div>
        </>
    );

    // --------------------------------------------------------------------------------------

    if (showConfirmation) return confirmationContent;
    return <>{showSettingsOrMainContent}</>;
}
