import styles from './PriceInfo.module.css';
// import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
// import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';
import { LimitOrderIF } from '../../../utils/interfaces/exports';
import OpenOrderStatus from '../../Global/OpenOrderStatus/OpenOrderStatus';
import NoTokenIcon from '../../Global/NoTokenIcon/NoTokenIcon';
import { useLocation } from 'react-router-dom';

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

                {isBid ? (
                    quoteTokenLogo ? (
                        <img src={quoteTokenLogo} alt='quote token' />
                    ) : (
                        <NoTokenIcon
                            tokenInitial={quoteTokenSymbol?.charAt(0)}
                            width='27px'
                        />
                    )
                ) : baseTokenLogo ? (
                    <img src={baseTokenLogo} alt='base token' />
                ) : (
                    <NoTokenIcon
                        tokenInitial={baseTokenSymbol?.charAt(0)}
                        width='27px'
                    />
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
                        <NoTokenIcon
                            tokenInitial={quoteTokenSymbol?.charAt(0)}
                            width='27px'
                        />
                    )
                ) : baseTokenLogo ? (
                    <img src={baseTokenLogo} alt='base token' />
                ) : (
                    <NoTokenIcon
                        tokenInitial={baseTokenSymbol?.charAt(0)}
                        width='27px'
                    />
                )}
            </p>
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
