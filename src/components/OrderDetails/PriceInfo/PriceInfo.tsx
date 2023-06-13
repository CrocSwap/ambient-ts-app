import styles from './PriceInfo.module.css';

import { LimitOrderIF } from '../../../utils/interfaces/exports';
import OpenOrderStatus from '../../Global/OpenOrderStatus/OpenOrderStatus';
import { useLocation } from 'react-router-dom';
import TokenIcon from '../../Global/TokenIcon/TokenIcon';

type ItemIF = {
    slug: string;
    name: string;
    checked: boolean;
};

interface propsIF {
    limitOrder: LimitOrderIF;

    baseCollateralDisplay: string | undefined;
    quoteCollateralDisplay: string | undefined;

    usdValue: string | undefined;
    isDenomBase: boolean;
    isOrderFilled: boolean;
    isBid: boolean;
    controlItems: ItemIF[];
    approximateSellQtyTruncated: string;
    approximateBuyQtyTruncated: string;
    baseDisplayFrontend: string;
    quoteDisplayFrontend: string;
    quoteTokenLogo: string;
    baseTokenLogo: string;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    isFillStarted: boolean;
    truncatedDisplayPrice: string | undefined;
    truncatedDisplayPriceDenomByMoneyness: string | undefined;
}

export default function PriceInfo(props: propsIF) {
    const {
        isBid,
        approximateSellQtyTruncated,
        approximateBuyQtyTruncated,
        baseDisplayFrontend,
        quoteDisplayFrontend,
        isOrderFilled,
        quoteTokenLogo,
        baseTokenLogo,
        baseTokenSymbol,
        quoteTokenSymbol,
        isFillStarted,
        truncatedDisplayPrice,
        isDenomBase,
        usdValue,
        truncatedDisplayPriceDenomByMoneyness,
    } = props;
    const { pathname } = useLocation();

    const isOnTradeRoute = pathname.includes('trade');

    const buyContent = (
        <div className={styles.buy_content}>
            <p>Buy:</p>
            <p>
                {isOrderFilled
                    ? isBid
                        ? quoteDisplayFrontend
                        : baseDisplayFrontend
                    : approximateBuyQtyTruncated}

                <TokenIcon
                    src={isBid ? quoteTokenLogo : baseTokenLogo}
                    alt={isBid ? quoteTokenSymbol : baseTokenSymbol}
                    size='xl'
                />
            </p>
        </div>
    );
    const sellContent = (
        <div className={styles.sell_content}>
            <p>Sell:</p>
            <p>
                {isFillStarted
                    ? approximateSellQtyTruncated
                    : isBid
                    ? baseDisplayFrontend
                    : quoteDisplayFrontend}

                <TokenIcon
                    src={!isBid ? quoteTokenLogo : baseTokenLogo}
                    alt={!isBid ? quoteTokenSymbol : baseTokenSymbol}
                    size='xl'
                />
            </p>
        </div>
    );

    const tokenPairDetails = (
        <div className={styles.token_pair_details}>
            <div className={styles.token_pair_images}>
                <TokenIcon
                    src={baseTokenLogo}
                    alt={baseTokenSymbol}
                    size='2xl'
                />
                <TokenIcon
                    src={quoteTokenLogo}
                    alt={quoteTokenSymbol}
                    size='2xl'
                />
            </div>
            <p>
                {isDenomBase ? baseTokenSymbol : quoteTokenSymbol} /{' '}
                {isDenomBase ? quoteTokenSymbol : baseTokenSymbol}
            </p>
        </div>
    );

    const orderType = (
        <div className={styles.order_type}>
            <p>Type:</p>
            <p>Limit</p>
        </div>
    );
    const totalValue = (
        <div className={styles.order_type}>
            <p>Total Value:</p>
            <p>${usdValue}</p>
        </div>
    );

    const priceStatusContent = (
        <div className={styles.price_status_content}>
            <section>
                <p>Price:</p>
                <h2>
                    {isOnTradeRoute
                        ? truncatedDisplayPrice
                        : truncatedDisplayPriceDenomByMoneyness || '0'}
                </h2>
            </section>

            <section>
                <p>Status:</p>
                <OpenOrderStatus isFilled={isOrderFilled} />
            </section>
        </div>
    );

    return (
        <div className={styles.main_container}>
            <div className={styles.price_info_container}>
                {tokenPairDetails}
                {orderType}
                {totalValue}
                {buyContent}
                {sellContent}
                {priceStatusContent}
            </div>
        </div>
    );
}
