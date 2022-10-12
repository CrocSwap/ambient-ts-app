import RangeStatus from '../../../../Global/RangeStatus/RangeStatus';
import styles from './RangeAccordionContent.module.css';

interface RangeAccordionContentPropsIF {
    posHash: string;
    userNameToDisplay: string;
    min: string;
    max: string;
    value: string;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseDisplay: string;
    quoteDisplay: string;
    apy: number;
    isPositionInRange: boolean;
    isAmbient: boolean;
    isOwnerActiveAccount: boolean;
}
export default function RangeAccordionContent(props: RangeAccordionContentPropsIF) {
    const {
        posHash,
        userNameToDisplay,
        min,
        max,
        value,
        baseTokenSymbol,
        quoteTokenSymbol,
        baseDisplay,
        quoteDisplay,
        apy,
        isPositionInRange,
        isAmbient,
        isOwnerActiveAccount,
    } = props;

    const wallet = (
        <div className={styles.row}>
            <p>Wallet:</p>
            {userNameToDisplay}
        </div>
    );

    const ID = (
        <div className={styles.row}>
            <p>ID:</p>
            {posHash}
        </div>
    );

    const minDisplay = (
        <div className={styles.row}>
            <p>Min:</p>
            {min}
        </div>
    );
    const maxDisplay = (
        <div className={styles.row}>
            <p>Max:</p>
            {max}
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
    const apyDisplayDom = (
        <div className={styles.row}>
            <p>APR:</p>
            {apy}
        </div>
    );
    const statusDisplay = (
        <div className={styles.row}>
            <p>Status:</p>
            <RangeStatus isAmbient={isAmbient} isInRange={isPositionInRange} />
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
                {minDisplay}
                {maxDisplay}
                {valueDisplay}
                {baseDisplayDom}
                {quoteDisplayDom}
                {apyDisplayDom}
                {statusDisplay}
            </div>
            {actionButtonsDisplay}
        </div>
    );
}
