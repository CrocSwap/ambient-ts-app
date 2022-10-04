import styles from './TransactionAccordionContent.module.css';
import { RiExternalLinkLine } from 'react-icons/ri';
import useCopyToClipboard from '../../../../../utils/hooks/useCopyToClipboard';
import { useState } from 'react';
interface TransactionAccordionContentPropsIF {
    txHash: string;
    userNameToDisplay: string;
    price: string | undefined;
    side: string;
    value: string;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseDisplay: string;
    quoteDisplay: string;
    blockExplorer: string | undefined;
}
export default function TransactionAccordionContent(props: TransactionAccordionContentPropsIF) {
    // eslint-disable-next-line
    const [copyValue, copy] = useCopyToClipboard();
    // eslint-disable-next-line
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const {
        txHash,
        userNameToDisplay,
        price,
        side,
        value,
        baseTokenSymbol,
        quoteTokenSymbol,
        baseDisplay,
        quoteDisplay,
        blockExplorer,
    } = props;
    const wallet = (
        <div className={styles.row}>
            <p>Wallet:</p>
            {userNameToDisplay}
        </div>
    );

    const ID = (
        <div className={styles.row}>
            <p>ID</p>
            {txHash}
        </div>
    );

    const priceDisplay = (
        <div className={styles.row}>
            <p>Price</p>
            {price ?? '...'}
        </div>
    );

    const type = (
        <div className={styles.row}>
            <p>Type</p>
            Remove
        </div>
    );

    const sideDisplay = (
        <div className={styles.row}>
            <p>Side</p>
            {side.replace('range', '')}
        </div>
    );

    const valueDisplay = (
        <div className={styles.row}>
            <p>Value</p>
            {value}
        </div>
    );

    const baseDisplayDom = (
        <div className={styles.row}>
            <p>{baseTokenSymbol}</p>
            {baseDisplay}
        </div>
    );
    const quoteDisplayDom = (
        <div className={styles.row}>
            <p>{quoteTokenSymbol}</p>
            {quoteDisplay}
        </div>
    );

    function handleCopyAddress() {
        copy('example data');
        setOpenSnackbar(true);
    }

    function handleOpenExplorer() {
        if (txHash && blockExplorer) {
            const explorerUrl = `${blockExplorer}tx/${txHash}`;
            window.open(explorerUrl);
        }
    }

    const actionButtonsDisplay = (
        <div className={styles.buttons_container}>
            <button className={styles.option_button} onClick={handleOpenExplorer}>
                Explorer <RiExternalLinkLine />
            </button>
            <button className={styles.option_button} onClick={handleCopyAddress}>
                Copy Trade
            </button>
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.scroll_container}>
                {ID}
                {wallet}
                {priceDisplay}
                {valueDisplay}
                {baseDisplayDom}
                {quoteDisplayDom}
                {type}
                {sideDisplay}
            </div>
            {actionButtonsDisplay}
        </div>
    );
}
