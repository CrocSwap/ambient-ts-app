import { useState, useEffect } from 'react';
import { useProcessOrder } from '../../utils/hooks/useProcessOrder';
import { ILimitOrderState } from '../../utils/state/graphDataSlice';
import RemoveOrderButton from './RemoveOrderButton/RemoveOrderButton';
import RemoveOrderTokenHeader from './RemoveOrderTokenHeader/RemoveOrderTokenHeader';
import RemoveOrderInfo from './RemoveOrderInfo/RemoveOrderInfo';
import RemoveOrderWidth from './RemoveOrderWidth/RemoveOrderWidth';
import styles from './OrderRemoval.module.css';
import {
    CircleLoader,
    CircleLoaderFailed,
} from '../Global/LoadingAnimations/CircleLoader/CircleLoader';
import Button from '../Global/Button/Button';
import Animation from '../Global/Animation/Animation';
import completed from '../../assets/animations/completed.json';
import { FiExternalLink } from 'react-icons/fi';
import { BsArrowLeft } from 'react-icons/bs';
interface IOrderRemovalProps {
    limitOrder: ILimitOrderState;
    closeGlobalModal: () => void;
}

export default function OrderRemoval(props: IOrderRemovalProps) {
    const { limitOrder } = props;
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

    const removeFn = () => {
        setShowConfirmation(true);
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
            {showConfirmation && (
                // {showConfirmation && !removalDenied && (
                <div className={styles.button} onClick={resetConfirmation}>
                    <BsArrowLeft size={30} />
                </div>
            )}
            <div className={styles.confirmation_content}>{currentConfirmationData}</div>
        </div>
    );
    // ----------------------------END OF CONFIRMATION JSX------------------------------

    if (showConfirmation) return confirmationContent;
    return (
        <div>
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
            />
            <RemoveOrderButton removeFn={removeFn} disabled={false} title='Show Example Submit' />
        </div>
    );
}
