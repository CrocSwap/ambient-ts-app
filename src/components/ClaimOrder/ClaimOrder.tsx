import styles from './ClaimOrder.module.css';
import { useState, useEffect } from 'react';
import { useProcessOrder } from '../../utils/hooks/useProcessOrder';

import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
// import Toggle2 from '../Global/Toggle/Toggle2';
// import TooltipComponent from '../Global/TooltipComponent/TooltipComponent';
import ClaimOrderSettings from './ClaimOrderSettings/ClaimOrderSettings';
import ClaimOrderModalHeader from './ClaimOrderModalHeader/ClaimOrderModalHeader';
import ClaimOrderTokenHeader from './ClaimOrderTokenHeader/ClaimOrderTokenHeader';
import ClaimOrderInfo from './ClaimOrderInfo/ClaimOrderInfo';
import ClaimOrderButton from './ClaimOrderButton/ClaimOrderButton';
import { LimitOrderIF } from '../../utils/interfaces/exports';
import { useAppDispatch } from '../../utils/hooks/reduxToolkit';
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

interface propsIF {
    account: string;
    crocEnv: CrocEnv | undefined;
    chainData: ChainSpec;
    limitOrder: LimitOrderIF;
    closeGlobalModal: () => void;
}

export default function ClaimOrder(props: propsIF) {
    const { account, crocEnv, limitOrder, closeGlobalModal } = props;
    const {
        posLiqBaseDecimalCorrected,
        posLiqQuoteDecimalCorrected,
        // lowPriceDisplay,
        // highPriceDisplay,
        bidTick,
        askTick,
        // positionLiquidity,
        positionLiqTotalUSD,
        // userNameToDisplay,
        baseTokenSymbol,
        quoteTokenSymbol,
        isOrderFilled,
        isDenomBase,
        baseTokenLogo,
        quoteTokenLogo,
        usdValue,
        baseDisplayFrontend,
        quoteDisplayFrontend,
        baseDisplay,
        quoteDisplay,
        truncatedDisplayPrice,
    } = useProcessOrder(limitOrder, account);

    useEffect(() => {
        console.log({ limitOrder });
    }, [JSON.stringify(limitOrder)]);

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [newClaimTransactionHash, setNewClaimTransactionHash] = useState('');
    const [txErrorCode, setTxErrorCode] = useState('');
    // const [txErrorMessage, setTxErrorMessage] = useState('');
    const [showSettings, setShowSettings] = useState(false);

    const dispatch = useAppDispatch();

    const resetConfirmation = () => {
        setShowConfirmation(false);
        setNewClaimTransactionHash('');
        setTxErrorCode('');
        // setTxErrorMessage('');
    };

    useEffect(() => {
        if (!showConfirmation) {
            resetConfirmation();
        }
    }, [txErrorCode]);
    // eslint-disable-next-line
    const [claimPercentage, setClaimPercentage] = useState(100);
    // const [baseQtyToBeClaimed, setBaseQtyToBeClaimed] = useState<string>('…');
    // const [quoteQtyToBeClaimed, setQuoteQtyToBeClaimed] = useState<string>('…');

    // const baseQty = limitOrder.positionLiqBaseDecimalCorrected;
    // const quoteQty = limitOrder.positionLiqQuoteDecimalCorrected;

    // ---------------CLAIM FUNCTION TO BE REFACTORED

    const claimablePivotTime = limitOrder.claimableLiqPivotTimes
        ? parseInt(limitOrder.claimableLiqPivotTimes)
        : undefined;

    const claimFn = async () => {
        if (crocEnv && claimablePivotTime) {
            console.log({ claimablePivotTime });
            setShowConfirmation(true);
            setShowSettings(false);
            console.log({ limitOrder });
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
                                txType: 'Claim',
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
                                txType: 'Claim',
                            }),
                        );

                    // .burnLiq(BigNumber.from(positionLiquidity));
                }
            } catch (error) {
                console.log({ error });
                setTxErrorCode(error?.code);
                if (
                    error.reason === 'sending a transaction requires a signer'
                ) {
                    location.reload();
                }
                // setTxErrorMessage(error?.message);
            }
            //  const newLimitOrderChangeCacheEndpoint =
            //      'https://809821320828123.de:5000/new_limit_order_change?';

            //  if (tx?.hash) {
            //      fetch(
            //          newLimitOrderChangeCacheEndpoint +
            //              new URLSearchParams({
            //                  chainId: limitOrder.chainId.toString(),
            //                  tx: tx.hash,
            //                  user: account ?? '',
            //                  base: limitOrder.base,
            //                  quote: limitOrder.quote,
            //                  poolIdx: lookupChain(limitOrder.chainId).poolIndex.toString(),
            //                  positionType: 'knockout',
            //                  changeType: 'burn',
            //                  limitTick: limitOrder.askTick.toString(),
            //                  isBid: limitOrder.isBid.toString(), // boolean (Only applies if knockout is true.) Whether or not the knockout liquidity position is a bid (rather than an ask).
            //              }),
            //      );
            //  }
            let receipt;
            try {
                if (tx) receipt = await tx.wait();
            } catch (e) {
                const error = e as TransactionError;
                console.log({ error });
                // The user used "speed up" or something similar
                // in their client, but we now have the updated info
                if (isTransactionReplacedError(error)) {
                    console.log('repriced');
                    dispatch(removePendingTx(error.hash));
                    const newTransactionHash = error.replacement.hash;
                    dispatch(addPendingTx(newTransactionHash));
                    setNewClaimTransactionHash(newTransactionHash);
                    console.log({ newTransactionHash });
                    receipt = error.receipt;

                    //  if (newTransactionHash) {
                    //      fetch(
                    //          newLimitOrderChangeCacheEndpoint +
                    //              new URLSearchParams({
                    //                  chainId: limitOrder.chainId.toString(),
                    //                  tx: newTransactionHash,
                    //                  user: account ?? '',
                    //                  base: limitOrder.base,
                    //                  quote: limitOrder.quote,
                    //                  poolIdx: lookupChain(limitOrder.chainId).poolIndex.toString(),
                    //                  positionType: 'knockout',
                    //                  changeType: 'mint',
                    //                  limitTick: limitOrder.askTick.toString(),
                    //                  isBid: limitOrder.isBid.toString(), // boolean (Only applies if knockout is true.) Whether or not the knockout liquidity position is a bid (rather than an ask).
                    //                  liq: positionLiquidity, // boolean (Optional.) If true, transaction is immediately inserted into cache without checking whether tx has been mined.
                    //              }),
                    //      );
                    //  }
                } else if (isTransactionFailedError(error)) {
                    // console.log({ error });
                    receipt = error.receipt;
                }
            }

            if (receipt) {
                dispatch(addReceipt(JSON.stringify(receipt)));
                dispatch(removePendingTx(receipt.transactionHash));
            }
        }
    };

    // -------------END OF CLAIM FUNCTION TO BE REFACTORED

    // ----------------------------CONFIRMATION JSX------------------------------

    // const etherscanLink =
    //     chainData.blockExplorer + 'tx/' + newClaimTransactionHash;

    const claimSuccess = (
        <TxSubmittedSimplify
            hash={newClaimTransactionHash}
            content='Claim Transaction Successfully Submitted.'
        />
    );

    const claimPending = (
        <WaitingConfirmation content='Please Check the Metamask extension in your browser for notifications.' />
    );

    const [currentConfirmationData, setCurrentConfirmationData] =
        useState(claimPending);

    const transactionApproved = newClaimTransactionHash !== '';

    const transactionException = (
        <TransactionException resetConfirmation={resetConfirmation} />
    );

    const isTransactionDenied = txErrorCode === 'ACTION_REJECTED';
    const isTransactionException = txErrorCode === 'CALL_EXCEPTION';
    const isGasLimitException = txErrorCode === 'UNPREDICTABLE_GAS_LIMIT';
    const isInsufficientFundsException = txErrorCode === 'INSUFFICIENT_FUNDS';

    function handleConfirmationChange() {
        setCurrentConfirmationData(claimPending);

        if (transactionApproved) {
            setCurrentConfirmationData(claimSuccess);
        } else if (isTransactionDenied) {
            setCurrentConfirmationData(
                <TransactionDenied resetConfirmation={resetConfirmation} />,
            );
        } else if (
            isTransactionException ||
            isGasLimitException ||
            isInsufficientFundsException
        ) {
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
        <div className={styles.confirmation_container}>
            <div className={styles.confirmation_content}>
                {currentConfirmationData}
            </div>
        </div>
    );
    // ----------------------------END OF CONFIRMATION JSX------------------------------

    // ----------------------------- GASLESS TRANSACTION-----------------------

    // const gaslesssTransactionControl = (
    //     <section className={styles.gasless_container}>
    //         <h3>Enable Gasless Transaction</h3>

    //         <Toggle2
    //             isOn={false}
    //             handleToggle={() => console.log('toggled')}
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
        <div style={{ padding: '1rem' }}>
            <ClaimOrderModalHeader
                onClose={closeGlobalModal}
                title={showConfirmation ? '' : 'Claim Limit Order'}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                onGoBack={showSettings ? () => setShowSettings(false) : null}
            />

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
                baseTokenSymbol={baseTokenSymbol}
                quoteTokenSymbol={quoteTokenSymbol}
                baseTokenLogoURI={baseTokenLogo}
                quoteTokenLogoURI={quoteTokenLogo}
                posLiqBaseDecimalCorrected={posLiqBaseDecimalCorrected}
                posLiqQuoteDecimalCorrected={posLiqQuoteDecimalCorrected}
                claimPercentage={claimPercentage}
                usdValue={usdValue}
                bidTick={bidTick}
                askTick={askTick}
                baseDisplayFrontend={baseDisplayFrontend}
                quoteDisplayFrontend={quoteDisplayFrontend}
                baseDisplay={baseDisplay}
                quoteDisplay={quoteDisplay}
                positionLiqTotalUSD={positionLiqTotalUSD}
                positionLiquidity={limitOrder.positionLiq.toString()}
                baseClaimString={'2344'}
                quoteClaimString={'4543'}
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
    );

    // --------------------------------------------------------------------------------------

    if (showConfirmation) return confirmationContent;
    return <>{showSettingsOrMainContent}</>;
}
