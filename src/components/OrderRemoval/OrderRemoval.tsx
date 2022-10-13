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
interface IOrderRemovalProps {
    limitOrder: ILimitOrderState;
    closeGlobalModal: () => void;
}

export default function OrderRemoval(props: IOrderRemovalProps) {
    const { limitOrder, closeGlobalModal } = props;
    const {
        posLiqBaseDecimalCorrected,
        posLiqQuoteDecimalCorrected,
        // lowPriceDisplay,
        // highPriceDisplay,
        bidTick,
        askTick,
        positionLiquidity,
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

    const removeFn = () => {
        setShowConfirmation(true);
        setShowSettings(false);
        console.log('order removed');
        // rorder removal function here
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
                title={showConfirmation ? '' : 'Limit Order Removal'}
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
                positionLiqTotalUSD={positionLiqTotalUSD}
                positionLiquidity={positionLiquidity}
                baseRemovalString={baseQtyToBeRemoved}
                quoteRemovalString={quoteQtyToBeRemoved}
            />
            <RemoveOrderButton removeFn={removeFn} disabled={false} title='Show Example Submit' />
        </div>
    );

    // --------------------------------------------------------------------------------------

    if (showConfirmation) return confirmationContent;
    return <>{showSettingsOrMainContent}</>;
}
