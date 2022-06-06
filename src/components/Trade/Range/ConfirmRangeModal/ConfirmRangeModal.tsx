import Divider from '../../../Global/Divider/Divider';
import RangeStatus from '../../../Global/RangeStatus/RangeStatus';
import styles from './ConfirmRangeModal.module.css';
import SelectedRange from './SelectedRange/SelectedRange';
import Button from '../../../Global/Button/Button';
import { useState } from 'react';
import WaitingConfirmation from '../../../Global/WaitingConfirmation/WaitingConfirmation';
import TransactionSubmitted from '../../../Global/TransactionSubmitted/TransactionSubmitted';
import { TokenPairIF } from '../../../../utils/interfaces/TokenPairIF';

interface ConfirmRangeModalProps {
    sendTransaction: () => void;
    closeModal: () => void;
    newRangeTransactionHash: string;
    setNewRangeTransactionHash: React.Dispatch<React.SetStateAction<string>>;
    tokenPair: TokenPairIF;
    spotPriceDisplay: string;
    maxPriceDisplay: string;
    minPriceDisplay: string;
}

export default function ConfirmRangeModal(props: ConfirmRangeModalProps) {
    const {
        sendTransaction,
        closeModal,
        newRangeTransactionHash,
        setNewRangeTransactionHash,
        minPriceDisplay,
        maxPriceDisplay,
        spotPriceDisplay,
        tokenPair,
    } = props;
    const tokenA = tokenPair.dataTokenA;
    const tokenB = tokenPair.dataTokenB;

    console.log(tokenPair);
    const [confirmDetails, setConfirmDetails] = useState(true);
    const transactionApproved = newRangeTransactionHash !== '';
    const sellTokenQty = (document.getElementById('A-range-quantity') as HTMLInputElement)?.value;
    const buyTokenQty = (document.getElementById('B-range-quantity') as HTMLInputElement)?.value;

    const dataTokenA = {
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png',
        altText: 'Ethereum',
        shortName: 'ETH',
        qty: 0.0001,
    };
    const dataTokenB = {
        icon: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
        altText: 'dai',
        shortName: 'DAI',
        qty: 0.0898121212,
    };
    // RANGE HEADER DISPLAY

    const rangeHeader = (
        <section className={styles.position_display}>
            <div className={styles.token_display}>
                <div className={styles.tokens}>
                    <img src={dataTokenA.icon} alt={dataTokenA.altText} />
                    <img src={dataTokenB.icon} alt={dataTokenB.altText} />
                </div>
                <span className={styles.token_symbol}>
                    {dataTokenA.shortName}/{dataTokenB.shortName}
                </span>
            </div>
            <RangeStatus isInRange />
        </section>
    );
    // FEE TIER DISPLAY

    const feeTierDisplay = (
        <section className={styles.fee_tier_display}>
            <div className={styles.fee_tier_container}>
                <div className={styles.detail_line}>
                    <div>
                        <img src={dataTokenA.icon} alt={dataTokenA.altText} />
                        <span>{dataTokenA.shortName}</span>
                    </div>
                    <span>{sellTokenQty}</span>
                </div>
                <div className={styles.detail_line}>
                    <div>
                        <img src={dataTokenB.icon} alt={dataTokenB.altText} />
                        <span>{dataTokenB.shortName}</span>
                    </div>
                    <span>{buyTokenQty}</span>
                </div>
                <Divider />
                <div className={styles.detail_line}>
                    <span>CURRENT FEE TIER</span>

                    <span>{0.05}%</span>
                </div>
            </div>
        </section>
    );

    const fullTxDetails = (
        <>
            {rangeHeader}
            {feeTierDisplay}
            <SelectedRange
                minPriceDisplay={minPriceDisplay}
                maxPriceDisplay={maxPriceDisplay}
                spotPriceDisplay={spotPriceDisplay}
            />
        </>
    );

    // const tokenAData = {
    //     symbol: 'ETH',
    //     logoAltText: 'eth',
    //     logoLocal:
    //         'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png',
    // };
    // const tokenBData = {
    //     symbol: 'DAI',
    //     logoAltText: 'dai',
    //     logoLocal: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
    // };

    // CONFIRMATION LOGIC STARTS HERE
    const confirmSendMessage = (
        <WaitingConfirmation
            content={`Depositing Swapping ${sellTokenQty} ${tokenA.symbol} for ${buyTokenQty} ${tokenB.symbol}`}
        />
    );

    const transactionSubmitted = <TransactionSubmitted hash={newRangeTransactionHash} />;

    const confirmTradeButton = (
        <Button
            title='Send to Metamask'
            action={() => {
                console.log(`Sell Token Full name: ${tokenA.symbol} and quantity: ${sellTokenQty}`);
                console.log(`Buy Token Full name: ${tokenB.symbol} and quantity: ${buyTokenQty}`);
                sendTransaction();
                setConfirmDetails(false);
            }}
        />
    );

    function onConfirmRangeClose() {
        setConfirmDetails(true);
        setNewRangeTransactionHash('');
        closeModal();
    }

    const closeButton = <Button title='Close' action={onConfirmRangeClose} />;

    const confirmationDisplay = transactionApproved ? transactionSubmitted : confirmSendMessage;

    return (
        <div className={styles.confirm_range_modal_container}>
            <div>{confirmDetails ? fullTxDetails : confirmationDisplay}</div>
            <footer className={styles.modal_footer}>
                {confirmDetails ? confirmTradeButton : closeButton}
            </footer>
        </div>
    );
}
