import styles from './PriceInfo.module.css';
// import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
// import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';
import { useProcessOrder } from '../../../utils/hooks/useProcessOrder';
import { LimitOrderIF } from '../../../utils/interfaces/exports';
import OpenOrderStatus from '../../Global/OpenOrderStatus/OpenOrderStatus';
import NoTokenIcon from '../../Global/NoTokenIcon/NoTokenIcon';

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

        // bidTick,
        // askTick,
        // positionLiqTotalUSD,

        // baseDisplayFrontend,
        // quoteDisplayFrontend,
        // positionLiquidity,
    } = useProcessOrder(limitOrder, account);

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
    const buyContent = (
        <div className={styles.buy_content}>
            <p>Buy:</p>
            <p>
                {baseDisplayFrontend}
                {baseTokenLogo ? (
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
                {quoteDisplayFrontend}
                {quoteTokenLogo ? (
                    <img src={quoteTokenLogo} alt='quote token' />
                ) : (
                    <NoTokenIcon tokenInitial={quoteTokenSymbol.charAt(0)} width='27px' />
                )}
            </p>
        </div>
    );

    const priceStatusContent = (
        <div className={styles.price_status_content}>
            <section>
                <p>Price:</p>
                <h2>$1,571.90</h2>
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
