import styles from './ClaimOrder.module.css';
import { useState, useEffect } from 'react';
import { useProcessOrder } from '../../utils/hooks/useProcessOrder';
import { ILimitOrderState } from '../../utils/state/graphDataSlice';
import { CircleLoaderFailed } from '../Global/LoadingAnimations/CircleLoader/CircleLoader';
import Button from '../Global/Button/Button';
import Animation from '../Global/Animation/Animation';
import completed from '../../assets/animations/completed.json';
import { FiExternalLink } from 'react-icons/fi';
import { formatAmount } from '../../utils/numbers';
import { CrocEnv } from '@crocswap-libs/sdk';
import { BigNumber } from 'ethers';
import Toggle2 from '../Global/Toggle/Toggle2';
import TooltipComponent from '../Global/TooltipComponent/TooltipComponent';

interface IClaimOrderProps {
    crocEnv: CrocEnv | undefined;
    limitOrder: ILimitOrderState;
    closeGlobalModal: () => void;
}

export default function ClaimOrder(props: IClaimOrderProps) {
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
    const [newClaimTransactionHash, setNewClaimTransactionHash] = useState('');
    const [txErrorCode, setTxErrorCode] = useState(0);
    const [txErrorMessage, setTxErrorMessage] = useState('');
    const [showSettings, setShowSettings] = useState(false);

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

    const [claimPercentage, setClaimPercentage] = useState(100);
    const [baseQtyToBeClaimed, setBaseQtyToBeClaimed] = useState<string>('…');
    const [quoteQtyToBeClaimed, setQuoteQtyToBeClaimed] = useState<string>('…');

    const baseQty = limitOrder.positionLiqBaseDecimalCorrected;
    const quoteQty = limitOrder.positionLiqQuoteDecimalCorrected;

    // ---------------CLAIM FUNCTION TO BE REFACTORED

    const claimFn = async () => {
        if (crocEnv) {
            setShowConfirmation(true);
            setShowSettings(false);
            console.log({ limitOrder });
        }
        console.log('Order has been claimed');
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
            <Button title='Try Again' action={resetConfirmation} />
        </div>
    );
    const etherscanLink = 'chainData.blockExplorer' + 'tx/' + newClaimTransactionHash;

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

    return <div>claim</div>;
}
