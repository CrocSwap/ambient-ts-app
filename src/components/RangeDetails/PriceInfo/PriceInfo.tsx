import styles from './PriceInfo.module.css';

// import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
// import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';

import NoTokenIcon from '../../Global/NoTokenIcon/NoTokenIcon';
import Apy from '../../Global/Tabs/Apy/Apy';
import DividerDark from '../../Global/DividerDark/DividerDark';
import { useLocation } from 'react-router-dom';

type ItemIF = {
    slug: string;
    name: string;
    checked: boolean;
};
interface IPriceInfoProps {
    usdValue: string;
    lowRangeDisplay: string;
    highRangeDisplay: string;
    baseCollateralDisplay: string | undefined;
    quoteCollateralDisplay: string | undefined;
    baseFeesDisplay: string | undefined;
    quoteFeesDisplay: string | undefined;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    isAmbient: boolean;
    isDenomBase: boolean;
    poolPriceDisplay: number;
    controlItems: ItemIF[];
    positionApy: number | undefined;
    minRangeDenomByMoneyness: string;
    maxRangeDenomByMoneyness: string;
}

export default function PriceInfo(props: IPriceInfoProps) {
    // const dispatch = useAppDispatch();
    const {
        usdValue,
        lowRangeDisplay,
        highRangeDisplay,
        baseCollateralDisplay,
        quoteCollateralDisplay,
        baseFeesDisplay,
        quoteFeesDisplay,
        baseTokenLogoURI,
        quoteTokenLogoURI,
        baseTokenSymbol,
        quoteTokenSymbol,
        isAmbient,
        isDenomBase,
        // poolPriceDisplay,
        // controlItems,
        positionApy,
        minRangeDenomByMoneyness,
        maxRangeDenomByMoneyness,
    } = props;

    const { pathname } = useLocation();

    const isOnTradeRoute = pathname.includes('trade');

    const baseTokenLogoDisplay = baseTokenLogoURI ? (
        <img src={baseTokenLogoURI} alt={baseTokenSymbol} />
    ) : (
        <NoTokenIcon tokenInitial={baseTokenSymbol.charAt(0)} width='15px' />
    );
    const quoteTokenLogoDisplay = quoteTokenLogoURI ? (
        <img src={quoteTokenLogoURI} alt={quoteTokenSymbol} />
    ) : (
        <NoTokenIcon tokenInitial={quoteTokenSymbol.charAt(0)} width='15px' />
    );

    const totalValue = (
        <div className={styles.value_content}>
            <p>Total Value:</p>
            <p>${usdValue}</p>
        </div>
    );

    const pooledContent = <div className={styles.pooled_container}></div>;

    const earnedContent = isAmbient ? (
        <div className={styles.ambi_info_text}>
            Ambient position rewards are compounded back into the original
            position and are included in the amounts above.
        </div>
    ) : (
        <section>
            <div>
                <p>{`Earned ${baseTokenSymbol}`}</p>
                <p>
                    {baseFeesDisplay === undefined ? '…' : baseFeesDisplay}
                    {baseTokenLogoDisplay}
                </p>
            </div>

            <div>
                <p>{`Earned ${quoteTokenSymbol}`}</p>
                <p>
                    {quoteFeesDisplay === undefined ? '…' : quoteFeesDisplay}
                    {quoteTokenLogoDisplay}
                </p>
            </div>
        </section>
    );

    const priceStatusContent = (
        <div className={styles.price_status_content}>
            <section>
                <p>Range Min:</p>
                <h2 className={styles.low_range}>
                    {isAmbient
                        ? '0'
                        : isOnTradeRoute
                        ? lowRangeDisplay
                        : minRangeDenomByMoneyness}
                </h2>
            </section>

            <section>
                <p>Range Max:</p>
                <h2 className={styles.high_range}>
                    {isAmbient
                        ? '∞'
                        : isOnTradeRoute
                        ? highRangeDisplay
                        : maxRangeDenomByMoneyness}
                </h2>
            </section>
        </div>
    );

    const tokenPairDetails = (
        <div
            className={styles.token_pair_details_container}
            onClick={() => {
                // dispatch(toggleDidUserFlipDenom());
            }}
        >
            <p>
                {isDenomBase ? baseTokenSymbol : quoteTokenSymbol} /{' '}
                {isDenomBase ? quoteTokenSymbol : baseTokenSymbol}
            </p>
        </div>
    );

    return (
        <div className={styles.main_container}>
            <div className={styles.price_info_container}>
                {tokenPairDetails}
                {totalValue}
                {pooledContent}
                <div className={styles.earned_container}>
                    <section>
                        <div>
                            <p>{`Pooled ${baseTokenSymbol}`}</p>
                            <p>
                                {baseCollateralDisplay === undefined
                                    ? '…'
                                    : baseCollateralDisplay}
                                {baseTokenLogoDisplay}
                            </p>
                        </div>

                        <div>
                            <p>{`Pooled ${quoteTokenSymbol}`}</p>
                            <p>
                                {quoteCollateralDisplay === undefined
                                    ? '…'
                                    : quoteCollateralDisplay}
                                {quoteTokenLogoDisplay}
                            </p>
                        </div>
                    </section>
                    <DividerDark />
                    {earnedContent}
                </div>

                {priceStatusContent}
                <Apy
                    amount={positionApy || undefined}
                    fs='48px'
                    lh='60px'
                    center
                    showTitle
                />
            </div>
        </div>
    );
}
