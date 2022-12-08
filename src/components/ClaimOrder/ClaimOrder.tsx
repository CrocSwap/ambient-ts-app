import styles from './ClaimOrder.module.css';
import { useState, useEffect } from 'react';
import { useProcessOrder } from '../../utils/hooks/useProcessOrder';
import { CircleLoaderFailed } from '../Global/LoadingAnimations/CircleLoader/CircleLoader';
import Button from '../Global/Button/Button';
import Animation from '../Global/Animation/Animation';
import completed from '../../assets/animations/completed.json';
import { FiExternalLink } from 'react-icons/fi';
import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
import Toggle2 from '../Global/Toggle/Toggle2';
import TooltipComponent from '../Global/TooltipComponent/TooltipComponent';
import ClaimOrderSettings from './ClaimOrderSettings/ClaimOrderSettings';
import ClaimOrderModalHeader from './ClaimOrderModalHeader/ClaimOrderModalHeader';
import ClaimOrderTokenHeader from './ClaimOrderTokenHeader/ClaimOrderTokenHeader';
import ClaimOrderInfo from './ClaimOrderInfo/ClaimOrderInfo';
import ClaimOrderButton from './ClaimOrderButton/ClaimOrderButton';
import { LimitOrderIF } from '../../utils/interfaces/exports';
import { useAppDispatch } from '../../utils/hooks/reduxToolkit';
import { addPendingTx, addReceipt, removePendingTx } from '../../utils/state/receiptDataSlice';
// import { useMoralis } from 'react-moralis';
// import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../utils/TransactionError';

interface IClaimOrderProps {
    crocEnv: CrocEnv | undefined;
    chainData: ChainSpec;
    limitOrder: LimitOrderIF;
    closeGlobalModal: () => void;
}

export default function ClaimOrder(props: IClaimOrderProps) {
    const { chainData, crocEnv, limitOrder, closeGlobalModal } = props;
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
    } = useProcessOrder(limitOrder);

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [newClaimTransactionHash, setNewClaimTransactionHash] = useState('');
    const [txErrorCode, setTxErrorCode] = useState(0);
    const [txErrorMessage, setTxErrorMessage] = useState('');
    const [showSettings, setShowSettings] = useState(false);

    const dispatch = useAppDispatch();
    // const { account } = useMoralis();

    const resetConfirmation = () => {
        setShowConfirmation(false);
        setNewClaimTransactionHash('');
        setTxErrorCode(0);
        setTxErrorMessage('');
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

    const claimFn = async () => {
        if (crocEnv && limitOrder.latestCrossPivotTime) {
            setShowConfirmation(true);
            setShowSettings(false);
            console.log({ limitOrder });
            let tx;
            try {
                if (limitOrder.isBid === true) {
                    tx = await crocEnv
                        .buy(limitOrder.quote, 0)
                        .atLimit(limitOrder.base, limitOrder.bidTick)
                        .recoverPost(limitOrder.latestCrossPivotTime, { surplus: false });
                    setNewClaimTransactionHash(tx.hash);
                    dispatch(addPendingTx(tx?.hash));
                } else {
                    tx = await crocEnv
                        .buy(limitOrder.base, 0)
                        .atLimit(limitOrder.quote, limitOrder.askTick)
                        .recoverPost(limitOrder.latestCrossPivotTime, { surplus: false });
                    setNewClaimTransactionHash(tx.hash);
                    dispatch(addPendingTx(tx?.hash));

                    // .burnLiq(BigNumber.from(positionLiquidity));
                }
            } catch (error) {
                console.log({ error });
                setTxErrorCode(error?.code);
                setTxErrorMessage(error?.message);
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
    const claimDenied = (
        <div className={styles.removal_pending}>
            <CircleLoaderFailed />
            <p>
                Check the Metamask extension in your browser for notifications, or click &quot;Try
                Again&quot;. You can also click the left arrow above to try again.
            </p>
            <Button title='Try Again' action={resetConfirmation} flat={true} />
        </div>
    );
    const etherscanLink = chainData.blockExplorer + 'tx/' + newClaimTransactionHash;

    const claimSuccess = (
        <div className={styles.removal_pending}>
            <div className={styles.completed_animation}>
                <Animation animData={completed} loop={false} />
            </div>
            <p>Removal Transaction Successfully Submitted</p>
            <a
                href={etherscanLink}
                target='_blank'
                rel='noreferrer'
                className={styles.view_etherscan}
            >
                View on Etherscan
                <FiExternalLink size={20} color='black' />
            </a>
        </div>
    );

    const claimPending = (
        <div className={styles.removal_pending}>
            <div className={styles.loader} />

            <p>Check the Metamask extension in your browser for notifications.</p>
        </div>
    );

    const [currentConfirmationData, setCurrentConfirmationData] = useState(claimPending);

    const transactionApproved = newClaimTransactionHash !== '';

    const isRemovalDenied =
        txErrorCode === 4001 &&
        txErrorMessage === 'MetaMask Tx Signature: User denied transaction signature.';

    function handleConfirmationChange() {
        setCurrentConfirmationData(claimPending);

        if (transactionApproved) {
            setCurrentConfirmationData(claimSuccess);
        } else if (isRemovalDenied) {
            setCurrentConfirmationData(claimDenied);
        }
    }

    useEffect(() => {
        handleConfirmationChange();
    }, [
        transactionApproved,

        newClaimTransactionHash,
        txErrorCode,
        showConfirmation,
        isRemovalDenied,
    ]);

    const confirmationContent = (
        <div className={styles.confirmation_container}>
            <div className={styles.confirmation_content}>{currentConfirmationData}</div>
        </div>
    );
    // ----------------------------END OF CONFIRMATION JSX------------------------------

    // ----------------------------- GASLESS TRANSACTION-----------------------

    const gaslesssTransactionControl = (
        <section className={styles.gasless_container}>
            <h3>Enable Gasless Transaction</h3>

            <Toggle2
                isOn={false}
                handleToggle={() => console.log('toggled')}
                id='gasless_transaction_toggle_claim_order'
                disabled={true}
            />
        </section>
    );

    // ----------------------------- END OF GASLESS TRANSACTION-----------------------

    // ---------------------Explanation data DISPLAY-----------------------------

    const tooltipExplanationData = [
        {
            title: 'Network Fee',
            tooltipTitle: 'something here about network fee',
            data: '-$3.69',
            // data: isDenomBase
            //     ? `${displayLimitPriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
            //     : `${displayLimitPriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`,
        },
    ];

    const tooltipExplanationDataDisplay = (
        <div className={styles.explanation_details}>
            {tooltipExplanationData.map((item, idx) => (
                <div className={styles.extra_row} key={idx}>
                    <div className={styles.align_center}>
                        <div>{item.title}</div>
                        <TooltipComponent title={item.tooltipTitle} />
                    </div>
                    <div className={styles.data}>{item.data}</div>
                </div>
            ))}
        </div>
    );

    // ---------------------Explanation data DISPLAY-----------------------------

    const showSettingsOrMainContent = showSettings ? (
        <ClaimOrderSettings
            showSettings={showSettings}
            setShowSettings={setShowSettings}
            onBackClick={resetConfirmation}
        />
    ) : (
        <div>
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
                pivotTime={limitOrder.pivotTime}
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
            />
            {gaslesssTransactionControl}
            {tooltipExplanationDataDisplay}
            <ClaimOrderButton claimFn={claimFn} disabled={false} title='Claim Limit Order' />
        </div>
    );

    // --------------------------------------------------------------------------------------

    if (showConfirmation) return confirmationContent;
    return <>{showSettingsOrMainContent}</>;
}
