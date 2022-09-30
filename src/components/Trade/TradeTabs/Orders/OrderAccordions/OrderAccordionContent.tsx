import styles from './OrderAccordionContent.module.css';

interface OrderAccordionContentPropsIF {
    posHash: string;
    userNameToDisplay: string;
    price: string | undefined;
    side: string;
    value: string;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseDisplay: string;
    quoteDisplay: string;
    isOrderFilled: boolean;
    isOwnerActiveAccount: boolean;
    // blockExplorer: string | undefined;
}

export default function OrderAccordionContent(props: OrderAccordionContentPropsIF) {
    const {
        posHash,
        userNameToDisplay,
        price,
        side,
        value,
        baseTokenSymbol,
        quoteTokenSymbol,
        baseDisplay,
        quoteDisplay,
        isOrderFilled,
        isOwnerActiveAccount,
        // blockExplorer,
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
            {posHash}
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
    const statusDisplay = (
        <div className={styles.row}>
            <p>Status</p>
            {isOrderFilled ? 'Filled' : 'Not Filled'}
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

    const actionButtonsDisplay = (
        <div className={styles.buttons_container}>
            <button className={styles.option_button}>Details</button>
            <button className={styles.option_button}>Copy</button>
            {isOwnerActiveAccount && <button className={styles.option_button}>Edit</button>}
            {isOwnerActiveAccount && <button className={styles.option_button}>Remove</button>}
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
                {statusDisplay}
            </div>
            {actionButtonsDisplay}
        </div>
    );
}
