import { useState, useEffect } from 'react';
import { useProcessOrder } from '../../utils/hooks/useProcessOrder';
import RemoveOrderButton from './RemoveOrderButton/RemoveOrderButton';
import RemoveOrderTokenHeader from './RemoveOrderTokenHeader/RemoveOrderTokenHeader';
import RemoveOrderInfo from './RemoveOrderInfo/RemoveOrderInfo';
import RemoveOrderWidth from './RemoveOrderWidth/RemoveOrderWidth';
import styles from './OrderRemoval.module.css';
import { CircleLoaderFailed } from '../Global/LoadingAnimations/CircleLoader/CircleLoader';
import Button from '../Global/Button/Button';
import Animation from '../Global/Animation/Animation';
import completed from '../../assets/animations/completed.json';
import { FiExternalLink } from 'react-icons/fi';
import RemoveOrderModalHeader from './RemoveOrderModalHeader/RemoveOrderModalHeader';
import RemoveOrderSettings from './RemoveOrderSettings/RemoveOrderSettings';
import { formatAmountOld } from '../../utils/numbers';
import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
import { BigNumber } from 'ethers';
import Toggle2 from '../Global/Toggle/Toggle2';
import TooltipComponent from '../Global/TooltipComponent/TooltipComponent';
import { LimitOrderIF } from '../../utils/interfaces/exports';
import { useAppDispatch } from '../../utils/hooks/reduxToolkit';
import { addPendingTx, addReceipt, removePendingTx } from '../../utils/state/receiptDataSlice';
import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../utils/TransactionError';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';

interface IOrderRemovalProps {
    account: string;
    crocEnv: CrocEnv | undefined;
    chainData: ChainSpec;
    limitOrder: LimitOrderIF;
    closeGlobalModal: () => void;
}

export default function OrderRemoval(props: IOrderRemovalProps) {
    const { account, chainData, crocEnv, limitOrder, closeGlobalModal } = props;
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
    } = useProcessOrder(limitOrder, account);

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [newRemovalTransactionHash, setNewRemovalTransactionHash] = useState('');
    const [txErrorCode, setTxErrorCode] = useState(0);
    const [txErrorMessage, setTxErrorMessage] = useState('');
    const [showSettings, setShowSettings] = useState(false);

    const resetConfirmation = () => {
        setShowConfirmation(false);
        setNewRemovalTransactionHash('');
        setTxErrorCode(0);
        setTxErrorMessage('');
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
        if (baseRemovalTruncated !== undefined) setBaseQtyToBeRemoved(baseRemovalTruncated);
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
        if (quoteRemovalTruncated !== undefined) setQuoteQtyToBeRemoved(quoteRemovalTruncated);
    }, [removalPercentage]);

    const positionLiquidity = limitOrder.positionLiq;

    const removeFn = async () => {
        if (crocEnv) {
            setShowConfirmation(true);
            setShowSettings(false);
            console.log({ limitOrder });

            const liqToRemove = BigNumber.from(positionLiquidity).mul(removalPercentage).div(100);

            let tx;
            try {
                if (limitOrder.isBid === true) {
                    tx = await crocEnv
                        .buy(limitOrder.quote, 0)
                        .atLimit(limitOrder.base, limitOrder.bidTick)
                        // .burnLiq(BigNumber.from('1000'));
                        .burnLiq(liqToRemove);
                    setNewRemovalTransactionHash(tx.hash);
                    dispatch(addPendingTx(tx?.hash));
                } else {
                    tx = await crocEnv
                        .buy(limitOrder.base, 0)
                        .atLimit(limitOrder.quote, limitOrder.askTick)
                        // .burnLiq(BigNumber.from('1000'));
                        .burnLiq(liqToRemove);
                    setNewRemovalTransactionHash(tx.hash);
                    dispatch(addPendingTx(tx?.hash));
                }
            } catch (error) {
                console.log({ error });
                setTxErrorCode(error?.code);
                setTxErrorMessage(error?.message);
            }

            const newLimitOrderChangeCacheEndpoint =
                'https://809821320828123.de:5000/new_limit_order_change?';

            if (tx?.hash) {
                fetch(
                    newLimitOrderChangeCacheEndpoint +
                        new URLSearchParams({
                            chainId: limitOrder.chainId.toString(),
                            tx: tx.hash,
                            user: account ?? '',
                            base: limitOrder.base,
                            quote: limitOrder.quote,
                            poolIdx: lookupChain(limitOrder.chainId).poolIndex.toString(),
                            positionType: 'knockout',
                            changeType: 'mint',
                            limitTick: limitOrder.askTick.toString(),
                            isBid: limitOrder.isBid.toString(), // boolean (Only applies if knockout is true.) Whether or not the knockout liquidity position is a bid (rather than an ask).
                            liq: positionLiquidity, // boolean (Optional.) If true, transaction is immediately inserted into cache without checking whether tx has been mined.
                        }),
                );
            }

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
                    setNewRemovalTransactionHash(newTransactionHash);
                    console.log({ newTransactionHash });
                    receipt = error.receipt;

                    if (newTransactionHash) {
                        fetch(
                            newLimitOrderChangeCacheEndpoint +
                                new URLSearchParams({
                                    chainId: limitOrder.chainId.toString(),
                                    tx: newTransactionHash,
                                    user: account ?? '',
                                    base: limitOrder.base,
                                    quote: limitOrder.quote,
                                    poolIdx: lookupChain(limitOrder.chainId).poolIndex.toString(),
                                    positionType: 'knockout',
                                    changeType: 'mint',
                                    limitTick: limitOrder.askTick.toString(),
                                    isBid: limitOrder.isBid.toString(), // boolean (Only applies if knockout is true.) Whether or not the knockout liquidity position is a bid (rather than an ask).
                                    liq: positionLiquidity, // boolean (Optional.) If true, transaction is immediately inserted into cache without checking whether tx has been mined.
                                }),
                        );
                    }
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

    // ----------------------------CONFIRMATION JSX------------------------------

    const removalDenied = (
        <div className={styles.removal_pending}>
            <CircleLoaderFailed />
            <p>
                Check the Metamask extension in your browser for notifications, or click &quot;Try
                Again&quot;. You can also click the left arrow above to try again.
            </p>
            <Button title='Try Again' action={resetConfirmation} flat={true} />
        </div>
    );

    const etherscanLink = chainData.blockExplorer + 'tx/' + newRemovalTransactionHash;

    const removalSuccess = (
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

    const removalPending = (
        <div className={styles.removal_pending}>
            <div className={styles.loader} />

            <p>Check the Metamask extension in your browser for notifications.</p>
        </div>
    );

    const [currentConfirmationData, setCurrentConfirmationData] = useState(removalPending);

    const transactionApproved = newRemovalTransactionHash !== '';

    const isRemovalDenied =
        txErrorCode === 4001 &&
        txErrorMessage === 'MetaMask Tx Signature: User denied transaction signature.';

    function handleConfirmationChange() {
        setCurrentConfirmationData(removalPending);

        if (transactionApproved) {
            setCurrentConfirmationData(removalSuccess);
        } else if (isRemovalDenied) {
            setCurrentConfirmationData(removalDenied);
        }
    }

    useEffect(() => {
        handleConfirmationChange();
    }, [
        transactionApproved,

        newRemovalTransactionHash,
        txErrorCode,
        showConfirmation,
        isRemovalDenied,
    ]);

    const confirmationContent = (
        <div className={styles.confirmation_container}>
            {/* {showConfirmation && (
                <div className={styles.button} onClick={resetConfirmation}>
                    <BsArrowLeft size={30} />
                </div>
            )} */}
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
                id='gasless_transaction_toggle_remove_order'
                disabled={true}
            />
        </section>
    );

    // ----------------------------- END OF GASLESS TRANSACTION-----------------------

    // ---------------------SLIPPAGE TOLERANCE DISPLAY-----------------------------

    const tooltipExplanationData = [
        {
            title: 'Slippage Tolerance',
            tooltipTitle: 'something here',
            data: '0.5%',
        },
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

    // ---------------------SLIPPAGE TOLERANCE DISPLAY-----------------------------

    const showSettingsOrMainContent = showSettings ? (
        <RemoveOrderSettings
            showSettings={showSettings}
            setShowSettings={setShowSettings}
            onBackClick={resetConfirmation}
        />
    ) : (
        <div>
            <RemoveOrderModalHeader
                onClose={closeGlobalModal}
                title={showConfirmation ? '' : 'Remove Limit Order'}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                onGoBack={showSettings ? () => setShowSettings(false) : null}
            />

            <RemoveOrderTokenHeader
                isDenomBase={isDenomBase}
                isOrderFilled={isOrderFilled}
                baseTokenSymbol={baseTokenSymbol}
                quoteTokenSymbol={quoteTokenSymbol}
                baseTokenLogoURI={baseTokenLogo}
                quoteTokenLogoURI={quoteTokenLogo}
            />
            <RemoveOrderWidth
                removalPercentage={removalPercentage}
                setRemovalPercentage={setRemovalPercentage}
            />
            <RemoveOrderInfo
                baseTokenSymbol={baseTokenSymbol}
                quoteTokenSymbol={quoteTokenSymbol}
                baseTokenLogoURI={baseTokenLogo}
                quoteTokenLogoURI={quoteTokenLogo}
                posLiqBaseDecimalCorrected={posLiqBaseDecimalCorrected}
                posLiqQuoteDecimalCorrected={posLiqQuoteDecimalCorrected}
                removalPercentage={removalPercentage}
                usdValue={usdValue}
                bidTick={bidTick}
                askTick={askTick}
                baseDisplayFrontend={baseDisplayFrontend}
                quoteDisplayFrontend={quoteDisplayFrontend}
                baseDisplay={baseDisplay}
                quoteDisplay={quoteDisplay}
                positionLiqTotalUSD={positionLiqTotalUSD}
                positionLiquidity={limitOrder.positionLiq.toString()}
                baseRemovalString={baseQtyToBeRemoved}
                quoteRemovalString={quoteQtyToBeRemoved}
            />
            {gaslesssTransactionControl}
            {tooltipExplanationDataDisplay}
            <RemoveOrderButton removeFn={removeFn} disabled={false} title='Remove Limit Order' />
        </div>
    );

    // --------------------------------------------------------------------------------------

    if (showConfirmation) return confirmationContent;
    return <>{showSettingsOrMainContent}</>;
}
