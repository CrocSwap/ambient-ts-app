// START: Import Local Files
import styles from './RepositionPriceInfo.module.css';
// import truncateDecimals from '../../../../utils/data/truncateDecimals';
// import makeCurrentPrice from './makeCurrentPrice';
// import { TokenPairIF } from '../../../../utils/interfaces/exports';

// interface for component props
// interface IRepositionPriceInfoPropsIF {
//     tokenPair: TokenPairIF;
//     spotPriceDisplay: string;
//     maxPriceDisplay: string;
//     minPriceDisplay: string;
//     apyPercentage: number;
//     didUserFlipDenom: boolean;
//     poolPriceCharacter: string;
// }

// todo : take a look at RangePriceInfo.tsx. Should follow a similar approach.
// central react functional component
export default function RepositionPriceInfo() {
    // const {
    //     spotPriceDisplay,
    //     poolPriceCharacter,
    //     maxPriceDisplay,
    //     minPriceDisplay,
    //     apyPercentage,
    // } = props;

    // -----------------------------TEMPORARY PLACE HOLDERS--------------
    const apyPercentage = 10;
    const minPriceDisplay = 0;
    const spotPriceDisplay = 684.21;
    const maxPriceDisplay = 943.43;
    const poolPriceCharacter = 2;
    // -----------------------------END OF TEMPORARY PLACE HOLDERS--------------

    // JSX frag for estimated APY of position

    const apy = <span className={styles.apy}> Est. APY | {apyPercentage}%</span>;

    // JSX frag for lowest price in range
    const minimumPrice = (
        <div className={styles.price_display}>
            <h4 className={styles.price_title}>Min Price</h4>
            <span className={styles.min_price}>
                {minPriceDisplay}
                {/* {truncateDecimals(parseFloat(minPriceDisplay), 4).toString()} */}
            </span>
        </div>
    );

    // const currentPrice = makeCurrentPrice(parseFloat(spotPriceDisplay), didUserFlipDenom);
    const currentPrice = spotPriceDisplay;

    // JSX frag for highest price in range
    const maximumPrice = (
        <div className={styles.price_display}>
            <h4 className={styles.price_title}>Max Price</h4>
            <span className={styles.max_price}>{maxPriceDisplay}</span>
        </div>
    );

    // jsx for  Collateral
    const baseTokenCollateral = (
        <div className={styles.collateral_display}>
            <p className={styles.collateral_title}>ETH Collateral</p>
            <p className={styles.collateral_amount}>1.69</p>
        </div>
    );
    const quoteTokenCollateral = (
        <div className={styles.collateral_display}>
            <p className={styles.collateral_title}>USDC Collateral</p>
            <p className={styles.collateral_amount}>5,000.00</p>
        </div>
    );

    return (
        <div className={styles.price_info_container}>
            {apy}
            <div className={styles.price_info_content}>
                {minimumPrice}
                <div className={styles.price_display}>
                    <h4 className={styles.price_title}>Current Price</h4>
                    <span className={styles.current_price}>
                        {poolPriceCharacter}
                        {currentPrice}
                    </span>
                </div>
                {maximumPrice}
            </div>
            <div className={styles.collateral_container}>
                {baseTokenCollateral}
                {quoteTokenCollateral}
            </div>
        </div>
    );
}
