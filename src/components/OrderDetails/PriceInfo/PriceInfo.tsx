import styles from './PriceInfo.module.css';

import { LimitOrderIF, TokenIF } from '../../../ambient-utils/types';
import OpenOrderStatus from '../../Global/OpenOrderStatus/OpenOrderStatus';
import { useLocation } from 'react-router-dom';
import TokenIcon from '../../Global/TokenIcon/TokenIcon';
import { useContext } from 'react';
import { TokenContext } from '../../../contexts/TokenContext';
import { getFormattedNumber } from '../../../ambient-utils/dataLayer';

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
    baseDisplayFrontend: string;
    quoteDisplayFrontend: string;
    quoteTokenLogo: string;
    baseTokenLogo: string;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseTokenName: string;
    quoteTokenName: string;
    isFillStarted: boolean;
    truncatedDisplayPrice: string | undefined;
    truncatedDisplayPriceDenomByMoneyness: string | undefined;
    baseTokenAddress: string;
    quoteTokenAddress: string;
    fillPercentage: number;
    isAccountView: boolean;
    isBaseTokenMoneynessGreaterOrEqual: boolean;
}

export default function PriceInfo(props: propsIF) {
    const {
        limitOrder,
        isBid,
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
        baseTokenAddress,
        quoteTokenAddress,
        fillPercentage,
        isAccountView,
        isBaseTokenMoneynessGreaterOrEqual,
    } = props;

    const { pathname } = useLocation();
    const { tokens } = useContext(TokenContext);
    const baseToken: TokenIF | undefined =
        tokens.getTokenByAddress(baseTokenAddress);
    const quoteToken: TokenIF | undefined =
        tokens.getTokenByAddress(quoteTokenAddress);
    const isOnTradeRoute = pathname.includes('trade');

    const isDenomBaseLocal = isAccountView
        ? !isBaseTokenMoneynessGreaterOrEqual
        : isDenomBase;

    const isLimitOrderPartiallyFilled = isFillStarted && !isOrderFilled;

    const sellContent = (
        <div className={styles.sell_content}>
            <p>{'Sell:'}</p>
            <p>
                {isBid
                    ? getFormattedNumber({
                          value: limitOrder.originalPositionLiqBaseDecimalCorrected,
                      })
                    : getFormattedNumber({
                          value: limitOrder.originalPositionLiqQuoteDecimalCorrected,
                      })}
                <TokenIcon
                    token={!isBid ? quoteToken : baseToken}
                    src={!isBid ? quoteTokenLogo : baseTokenLogo}
                    alt={!isBid ? quoteTokenSymbol : baseTokenSymbol}
                    size='s'
                />
            </p>
        </div>
    );

    const buyContent = (
        <div className={styles.buy_content}>
            <p>{'Buy:'}</p>
            <p>
                {isBid
                    ? getFormattedNumber({
                          value: limitOrder.expectedPositionLiqQuoteDecimalCorrected,
                      })
                    : getFormattedNumber({
                          value: limitOrder.expectedPositionLiqBaseDecimalCorrected,
                      })}
                <TokenIcon
                    token={isBid ? quoteToken : baseToken}
                    src={isBid ? quoteTokenLogo : baseTokenLogo}
                    alt={isBid ? quoteTokenSymbol : baseTokenSymbol}
                    size='s'
                />
            </p>
        </div>
    );

    const baseTokenLargeDisplay = (
        <TokenIcon
            token={baseToken}
            src={baseTokenLogo}
            alt={baseTokenSymbol}
            size='2xl'
        />
    );

    const quoteTokenLargeDisplay = (
        <TokenIcon
            token={quoteToken}
            src={quoteTokenLogo}
            alt={quoteTokenSymbol}
            size='2xl'
        />
    );

    const tokenPairDetails = (
        <div className={styles.token_pair_details}>
            <div className={styles.token_pair_images}>
                {isDenomBaseLocal
                    ? baseTokenLargeDisplay
                    : quoteTokenLargeDisplay}
                {isDenomBaseLocal
                    ? quoteTokenLargeDisplay
                    : baseTokenLargeDisplay}
            </div>
            <p>
                {isDenomBaseLocal ? baseTokenSymbol : quoteTokenSymbol} /{' '}
                {isDenomBaseLocal ? quoteTokenSymbol : baseTokenSymbol}
            </p>
        </div>
    );

    const orderType = (
        <div className={styles.order_type}>
            <p>Order Type:</p>
            <p>{'Limit'}</p>
        </div>
    );
    const totalValue = (
        <div className={styles.order_type}>
            <p>Total Value:</p>
            <p>{usdValue}</p>
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
                <OpenOrderStatus
                    isFilled={isOrderFilled}
                    isLimitOrderPartiallyFilled={isLimitOrderPartiallyFilled}
                    fillPercentage={fillPercentage}
                />
            </section>
        </div>
    );

    return (
        <div className={styles.main_container}>
            <div className={styles.price_info_container}>
                {tokenPairDetails}
                {orderType}
                {(isDenomBaseLocal && isBid) || (!isDenomBaseLocal && !isBid)
                    ? sellContent
                    : buyContent}
                {(isDenomBaseLocal && isBid) || (!isDenomBaseLocal && !isBid)
                    ? buyContent
                    : sellContent}
                {totalValue}
                {priceStatusContent}
            </div>
        </div>
    );
}
