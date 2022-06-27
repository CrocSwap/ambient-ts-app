import Divider from '../../../Global/Divider/Divider';
import RangeStatus from '../../../Global/RangeStatus/RangeStatus';
import styles from './ConfirmRangeModal.module.css';
import SelectedRange from './SelectedRange/SelectedRange';
import Button from '../../../Global/Button/Button';
import { useState } from 'react';
import WaitingConfirmation from '../../../Global/WaitingConfirmation/WaitingConfirmation';
import TransactionSubmitted from '../../../Global/TransactionSubmitted/TransactionSubmitted';
import { TokenPairIF } from '../../../../utils/interfaces/exports';

interface ConfirmRangeModalProps {
    sendTransaction: () => void;
    closeModal: () => void;
    newRangeTransactionHash: string;
    setNewRangeTransactionHash: React.Dispatch<React.SetStateAction<string>>;
    tokenPair: TokenPairIF;
    spotPriceDisplay: string;
    maxPriceDisplay: string;
    minPriceDisplay: string;
    denominationsInBase: boolean;
    isTokenABase: boolean;
    isAmbient: boolean;
    isInRange: boolean;
    pinnedMinPriceDisplayTruncatedInBase: string;
    pinnedMinPriceDisplayTruncatedInQuote: string;
    pinnedMaxPriceDisplayTruncatedInBase: string;
    pinnedMaxPriceDisplayTruncatedInQuote: string;
    poolPriceTruncatedInBase: string;
    poolPriceTruncatedInQuote: string;
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
        denominationsInBase,
        isTokenABase,
        isAmbient,
        isInRange,
        pinnedMinPriceDisplayTruncatedInBase,
        pinnedMinPriceDisplayTruncatedInQuote,
        pinnedMaxPriceDisplayTruncatedInBase,
        pinnedMaxPriceDisplayTruncatedInQuote,
        poolPriceTruncatedInBase,
        poolPriceTruncatedInQuote,
    } = props;

    const tokenA = tokenPair.dataTokenA;
    const tokenB = tokenPair.dataTokenB;

    // console.log(tokenPair);
    const [confirmDetails, setConfirmDetails] = useState(true);
    const transactionApproved = newRangeTransactionHash !== '';
    const tokenAQty = (document.getElementById('A-range-quantity') as HTMLInputElement)?.value;
    const tokenBQty = (document.getElementById('B-range-quantity') as HTMLInputElement)?.value;

    // const dataTokenA = {
    //     icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png',
    //     altText: 'Ethereum',
    //     shortName: 'ETH',
    //     qty: 0.0001,
    // };
    const dataTokenA = tokenPair.dataTokenA;
    const dataTokenB = tokenPair.dataTokenB;
    // const dataTokenB = {
    //     icon: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
    //     altText: 'dai',
    //     shortName: 'DAI',
    //     qty: 0.0898121212,
    // };
    // RANGE HEADER DISPLAY

    const rangeHeader = (
        <section className={styles.position_display}>
            <div className={styles.token_display}>
                <div className={styles.tokens}>
                    <img src={dataTokenB.logoURI} alt={dataTokenB.name} />
                    <img src={dataTokenA.logoURI} alt={dataTokenA.name} />
                </div>
                <span className={styles.token_symbol}>
                    {dataTokenA.symbol}/{dataTokenB.symbol}
                </span>
            </div>
            <RangeStatus isInRange={isInRange} isAmbient={isAmbient} />
        </section>
    );
    // FEE TIER DISPLAY

    const feeTierDisplay = (
        <section className={styles.fee_tier_display}>
            <div className={styles.fee_tier_container}>
                <div className={styles.detail_line}>
                    <div>
                        <img src={dataTokenA.logoURI} alt={dataTokenA.name} />
                        <span>{dataTokenA.symbol}</span>
                    </div>
                    <span>{tokenAQty !== '' ? tokenAQty : '0'}</span>
                </div>
                <div className={styles.detail_line}>
                    <div>
                        <img src={dataTokenB.logoURI} alt={dataTokenB.name} />
                        <span>{dataTokenB.symbol}</span>
                    </div>
                    <span>{tokenBQty !== '' ? tokenBQty : '0'}</span>
                </div>
                <Divider />
                <div className={styles.detail_line}>
                    <span>CURRENT FEE TIER</span>

                    <span>{0.05}%</span>
                </div>
            </div>
        </section>
    );

    const selectedRangeOrNull = !isAmbient ? (
        <SelectedRange
            minPriceDisplay={minPriceDisplay}
            maxPriceDisplay={maxPriceDisplay}
            spotPriceDisplay={spotPriceDisplay}
            tokenPair={tokenPair}
            denominationsInBase={denominationsInBase}
            isTokenABase={isTokenABase}
            isAmbient={isAmbient}
            pinnedMinPriceDisplayTruncatedInBase={pinnedMinPriceDisplayTruncatedInBase}
            pinnedMinPriceDisplayTruncatedInQuote={pinnedMinPriceDisplayTruncatedInQuote}
            pinnedMaxPriceDisplayTruncatedInBase={pinnedMaxPriceDisplayTruncatedInBase}
            pinnedMaxPriceDisplayTruncatedInQuote={pinnedMaxPriceDisplayTruncatedInQuote}
            poolPriceTruncatedInBase={poolPriceTruncatedInBase}
            poolPriceTruncatedInQuote={poolPriceTruncatedInQuote}
        />
    ) : null;

    const fullTxDetails = (
        <>
            {rangeHeader}
            {feeTierDisplay}
            {selectedRangeOrNull}
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
            content={`Minting a Position with ${tokenAQty} ${tokenA.symbol} and ${tokenBQty} ${tokenB.symbol}`}
        />
    );

    const transactionSubmitted = <TransactionSubmitted hash={newRangeTransactionHash} />;

    const confirmTradeButton = (
        <Button
            title='Send to Metamask'
            action={() => {
                console.log(`Sell Token Full name: ${tokenA.symbol} and quantity: ${tokenAQty}`);
                console.log(
                    `Buy Token Full name: ${tokenB.symbol} and quantity: ${
                        tokenBQty !== '' ? tokenBQty : '0'
                    }`,
                );
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
