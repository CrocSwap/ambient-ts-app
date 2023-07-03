import styles from './EditPriceInfo.module.css';

interface EditPriceInfoIF {
    currentPoolPriceDisplay: string;
    quoteTokenSymbol: string;
    tokenAQtyDisplay: string;
    tokenBQtyDisplay: string;
    baseTokenSymbol: string;
    ambient: boolean;
    // lowRangeDisplay: string;
    // highRangeDisplay: string;
    denominationsInBase: boolean;
    pinnedMinPriceDisplayTruncated: string;
    pinnedMaxPriceDisplayTruncated: string;
    lowPriceDisplayTruncated: string;
    highPriceDisplayTruncated: string;
}

export default function EditPriceInfo(props: EditPriceInfoIF) {
    const {
        ambient,
        currentPoolPriceDisplay,
        denominationsInBase,
        baseTokenSymbol,
        quoteTokenSymbol,
        tokenAQtyDisplay,
        tokenBQtyDisplay,
        pinnedMinPriceDisplayTruncated,
        pinnedMaxPriceDisplayTruncated,
        lowPriceDisplayTruncated,
        highPriceDisplayTruncated,
    } = props;

    // JSX frag to display the pool price for the current pair
    const currentPrice = (
        <div className={styles.price_info_row}>
            <span>Current Price</span>
            <span>
                {currentPoolPriceDisplay}{' '}
                {denominationsInBase ? quoteTokenSymbol : baseTokenSymbol} per{' '}
                {denominationsInBase ? baseTokenSymbol : quoteTokenSymbol}
            </span>
        </div>
    );

    // JSX frag to display the estimated APR of the position
    const estimatedAPR = (
        <div className={styles.price_info_row}>
            <span>Est. APR</span>
            <span className='primary_apr'>35.68%</span>
        </div>
    );

    // JSX frag to display text for the table head
    const tableHead = (
        <thead>
            <tr>
                <th></th>
                <th>Current</th>
                <th>Repositioned To</th>
            </tr>
        </thead>
    );

    // JSX frag to display the balance of Token A
    const balanceTokenA = (
        <tr>
            <td data-column='Target: '>{baseTokenSymbol} Balance</td>
            <td data-column='Current'>{tokenAQtyDisplay}</td>
            <td data-column='Repositioned To'>0.69</td>
        </tr>
    );

    // JSX frag to display the balance of Token B
    const balanceTokenB = (
        <tr>
            <td data-column='Target: '>{quoteTokenSymbol} Balance</td>
            <td data-column='Current'>{tokenBQtyDisplay}</td>
            <td data-column='Repositioned To'>500.0</td>
        </tr>
    );

    // JSX frag to display the upper price limit of the position
    const rangeUpperLimit = (
        <tr>
            <td data-column='Target: '>Range Upper Limit</td>
            <td data-column='Current'>{highPriceDisplayTruncated}</td>
            <td data-column='Repositioned To'>
                {pinnedMaxPriceDisplayTruncated}
            </td>
        </tr>
    );

    // JSX frag to display the lower price limit of the position
    const rangeLowerLimit = (
        <tr>
            <td data-column='Target: '>Range Lower Limit</td>
            <td data-column='Current'>{lowPriceDisplayTruncated}</td>
            <td data-column='Repositioned To'>
                {pinnedMinPriceDisplayTruncated}
            </td>
        </tr>
    );

    return (
        <div className={styles.price_info_container}>
            <div className={styles.price_info_content}>
                {currentPrice}
                {estimatedAPR}
                <div className={styles.advanced_table_display}>
                    <table>
                        {tableHead}
                        <tbody>
                            {balanceTokenA}
                            {balanceTokenB}
                            {ambient == false && rangeUpperLimit}
                            {ambient == false && rangeLowerLimit}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
