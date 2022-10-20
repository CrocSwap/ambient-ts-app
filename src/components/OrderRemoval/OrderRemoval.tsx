import { useState, useEffect } from 'react';
import { useProcessOrder } from '../../utils/hooks/useProcessOrder';
import { ILimitOrderState } from '../../utils/state/graphDataSlice';
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
import { formatAmount } from '../../utils/numbers';
import { CrocEnv } from '@crocswap-libs/sdk';
import { BigNumber } from 'ethers';
import Toggle2 from '../Global/Toggle/Toggle2';
import TooltipComponent from '../Global/TooltipComponent/TooltipComponent';
interface IOrderRemovalProps {
    crocEnv: CrocEnv | undefined;
    limitOrder: ILimitOrderState;
    closeGlobalModal: () => void;
}

export default function OrderRemoval(props: IOrderRemovalProps) {
    const { crocEnv, limitOrder, closeGlobalModal } = props;
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
                ? formatAmount(baseRemovalNum)
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
                ? formatAmount(quoteRemovalNum)
                : quoteRemovalNum.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  });
        if (quoteRemovalTruncated !== undefined) setQuoteQtyToBeRemoved(quoteRemovalTruncated);
    }, [removalPercentage]);

    // const positionLiquidity = limitOrder.positionLiq;

    const removeFn = async () => {
        if (crocEnv) {
            setShowConfirmation(true);
            setShowSettings(false);
            console.log({ limitOrder });
            if (limitOrder.isBid === true) {
                crocEnv
                    .sell(limitOrder.base, 0)
                    .atLimit(limitOrder.quote, limitOrder.askTick)
                    .burnLiq(BigNumber.from('1000'));
                // .burnLiq(BigNumber.from(positionLiquidity));
            } else {
                crocEnv
                    .sell(limitOrder.quote, 0)
                    .atLimit(limitOrder.base, limitOrder.bidTick)
                    .burnLiq(BigNumber.from('1000'));
                // .burnLiq(BigNumber.from(positionLiquidity));
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
            <Button title='Try Again' action={resetConfirmation} />
        </div>
    );

    const etherscanLink = 'chainData.blockExplorer' + 'tx/' + newRemovalTransactionHash;

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
