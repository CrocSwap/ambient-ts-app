// START: Import Local Files
import { PositionIF } from '../../../../utils/interfaces/PositionIF';
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
//     aprPercentage: number;
//     didUserFlipDenom: boolean;
//     poolPriceCharacter: string;
// }

interface IRepositionPriceInfoProps {
    position: PositionIF | undefined;
}

// todo : take a look at RangePriceInfo.tsx. Should follow a similar approach.
// central react functional component
export default function RepositionPriceInfo(props: IRepositionPriceInfoProps) {
    // const {
    //     spotPriceDisplay,
    //     poolPriceCharacter,
    //     maxPriceDisplay,
    //     minPriceDisplay,
    //     aprPercentage,
    // } = props;

    const { position } = props;

    const baseSymbol = position?.baseSymbol;
    const quoteSymbol = position?.quoteSymbol;
    const currentBaseQtyDisplay = position?.positionLiqBaseDecimalCorrected;
    const currentQuoteQtyDisplay = position?.positionLiqQuoteDecimalCorrected;

    const currentBaseQtyDisplayTruncated = currentBaseQtyDisplay
        ? currentBaseQtyDisplay < 2
            ? currentBaseQtyDisplay.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : currentBaseQtyDisplay.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : '0.00';

    const currentQuoteQtyDisplayTruncated = currentQuoteQtyDisplay
        ? currentQuoteQtyDisplay < 2
            ? currentQuoteQtyDisplay.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : currentQuoteQtyDisplay.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : '0.00';

    // -----------------------------TEMPORARY PLACE HOLDERS--------------
    const aprPercentage = 10;
    const minPriceDisplay = 0;
    const spotPriceDisplay = 684.21;
    const maxPriceDisplay = 943.43;
    const poolPriceCharacter = 2;
    // -----------------------------END OF TEMPORARY PLACE HOLDERS--------------

    // JSX frag for estimated APR of position

    const apr = <span className={styles.apr}> Est. APR | {aprPercentage}%</span>;

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
            <p className={styles.collateral_title}>Current {baseSymbol} Collateral</p>
            <p className={styles.collateral_amount}>{currentBaseQtyDisplayTruncated}</p>
        </div>
    );
    const quoteTokenCollateral = (
        <div className={styles.collateral_display}>
            <p className={styles.collateral_title}>Current {quoteSymbol} Collateral</p>
            <p className={styles.collateral_amount}>{currentQuoteQtyDisplayTruncated}</p>
        </div>
    );

    return (
        <div className={styles.price_info_container}>
            {apr}
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
