import styles from './PriceInfo.module.css';
// import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
// import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';
import { useProcessOrder } from '../../../utils/hooks/useProcessOrder';
import { LimitOrderIF } from '../../../utils/interfaces/exports';
import OpenOrderStatus from '../../Global/OpenOrderStatus/OpenOrderStatus';
import NoTokenIcon from '../../Global/NoTokenIcon/NoTokenIcon';
import { formatAmountOld } from '../../../utils/numbers';

type ItemIF = {
    slug: string;
    name: string;
    checked: boolean;
};

interface propsIF {
    // usdValue: number | undefined;
    account: string;
    limitOrder: LimitOrderIF;
    // lowRangeDisplay: string;
    // highRangeDisplay: string;
    baseCollateralDisplay: string | undefined;
    quoteCollateralDisplay: string | undefined;
    // baseFeesDisplay: string | undefined;
    // quoteFeesDisplay: string | undefined;
    // baseTokenLogoURI: string;
    // quoteTokenLogoURI: string;
    // baseTokenSymbol: string;
    // quoteTokenSymbol: string;
    usdValue: string | undefined;
    // isDenomBase: boolean;
    isOrderFilled: boolean;
    controlItems: ItemIF[];
}

export default function PriceInfo(props: propsIF) {
    const { account, limitOrder, isOrderFilled } = props;
    // const dispatch = useAppDispatch();
    const {
        // usdValue,
        baseTokenSymbol,
        quoteTokenSymbol,
        baseDisplayFrontend,
        quoteDisplayFrontend,
        isDenomBase,
        baseTokenLogo,
        quoteTokenLogo,

        usdValue,
        truncatedDisplayPrice,
        // bidTick,
        // askTick,
        // positionLiqTotalUSD,

        // baseDisplayFrontend,
        // quoteDisplayFrontend,
        // positionLiquidity,
    } = useProcessOrder(limitOrder, account);

    console.log({ limitOrder });

    const isBid = limitOrder.isBid;

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

    const orderType = (
        <div className={styles.order_type}>
            <p>Order Type:</p>
            <p>Limit</p>
        </div>
    );
    const totalValue = (
        <div className={styles.order_type}>
            <p>Total Value:</p>
            <p>${usdValue}</p>
        </div>
    );

    const limitPriceString = truncatedDisplayPrice ? truncatedDisplayPrice : '0';
    // console.log({ limitPriceString });

    const parsedLimitPriceNum = parseFloat(limitPriceString.replace(/,/, ''));
    const baseDisplayFrontendNum = parseFloat(baseDisplayFrontend.replace(/,/, ''));
    const quoteDisplayFrontendNum = parseFloat(quoteDisplayFrontend.replace(/,/, ''));

    const isFillStarted = isBid ? quoteDisplayFrontendNum !== 0 : baseDisplayFrontendNum !== 0;

    const approximateSellQty = isBid
        ? isDenomBase
            ? quoteDisplayFrontendNum / parsedLimitPriceNum
            : quoteDisplayFrontendNum * parsedLimitPriceNum
        : isDenomBase
        ? baseDisplayFrontendNum * parsedLimitPriceNum
        : baseDisplayFrontendNum / parsedLimitPriceNum;

    // console.log({ approximateSellQty });

    const approximateSellQtyTruncated =
        approximateSellQty === 0
            ? '0'
            : approximateSellQty < 0.0001
            ? approximateSellQty.toExponential(2)
            : approximateSellQty < 2
            ? approximateSellQty.toPrecision(3)
            : approximateSellQty >= 100000
            ? formatAmountOld(approximateSellQty)
            : approximateSellQty.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    // console.log({ parsedLimitPriceNum });

    const approximateBuyQty = isFillStarted
        ? isBid
            ? isDenomBase
                ? approximateSellQty * parsedLimitPriceNum
                : approximateSellQty / parsedLimitPriceNum
            : isDenomBase
            ? approximateSellQty / parsedLimitPriceNum
            : approximateSellQty * parsedLimitPriceNum
        : isBid
        ? isDenomBase
            ? baseDisplayFrontendNum * parsedLimitPriceNum
            : baseDisplayFrontendNum / parsedLimitPriceNum
        : isDenomBase
        ? quoteDisplayFrontendNum / parsedLimitPriceNum
        : quoteDisplayFrontendNum * parsedLimitPriceNum;

    // console.log({ approximateBuyQty });

    const approximateBuyQtyTruncated =
        approximateBuyQty === 0
            ? '0'
            : approximateBuyQty < 0.0001
            ? approximateBuyQty.toExponential(2)
            : approximateBuyQty < 2
            ? approximateBuyQty.toPrecision(3)
            : approximateBuyQty >= 100000
            ? formatAmountOld(approximateBuyQty)
            : approximateBuyQty.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    // console.log({ isOrderFilled });
    // console.log({ isBid });
    // console.log({ quoteDisplayFrontend });
    // console.log({ baseDisplayFrontend });
    // console.log({ approximateBuyQtyTruncated });
    // console.log({ approximateSellQtyTruncated });
    // console.log({ truncatedDisplayPrice });

    const buyContent = (
        <div className={styles.buy_content}>
            <p>Buy:</p>
            <p>
                {isOrderFilled
                    ? isBid
                        ? quoteDisplayFrontend
                        : baseDisplayFrontend
                    : approximateBuyQtyTruncated}

                {isBid ? (
                    quoteTokenLogo ? (
                        <img src={quoteTokenLogo} alt='quote token' />
                    ) : (
                        <NoTokenIcon tokenInitial={quoteTokenSymbol.charAt(0)} width='27px' />
                    )
                ) : baseTokenLogo ? (
                    <img src={baseTokenLogo} alt='base token' />
                ) : (
                    <NoTokenIcon tokenInitial={baseTokenSymbol.charAt(0)} width='27px' />
                )}
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
                {!isBid ? (
                    quoteTokenLogo ? (
                        <img src={quoteTokenLogo} alt='quote token' />
                    ) : (
                        <NoTokenIcon tokenInitial={quoteTokenSymbol.charAt(0)} width='27px' />
                    )
                ) : baseTokenLogo ? (
                    <img src={baseTokenLogo} alt='base token' />
                ) : (
                    <NoTokenIcon tokenInitial={baseTokenSymbol.charAt(0)} width='27px' />
                )}
            </p>
        </div>
    );

    const priceStatusContent = (
        <div className={styles.price_status_content}>
            <section>
                <p>Price:</p>
                <h2>{truncatedDisplayPrice}</h2>
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
