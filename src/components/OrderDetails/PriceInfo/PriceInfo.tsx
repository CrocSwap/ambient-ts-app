import styles from './PriceInfo.module.css';
import Row from '../../Global/Row/Row';
import { ILimitOrderState } from '../../../utils/state/graphDataSlice';

import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';
import Divider from '../../Global/Divider/Divider';
import { motion } from 'framer-motion';
import { useProcessOrder } from '../../../utils/hooks/useProcessOrder';

type ItemIF = {
    slug: string;
    name: string;
    checked: boolean;
};
interface IPriceInfoProps {
    // usdValue: number | undefined;
    limitOrder: ILimitOrderState;
    // lowRangeDisplay: string;
    // highRangeDisplay: string;
    // baseCollateralDisplay: string | undefined;
    // quoteCollateralDisplay: string | undefined;
    // baseFeesDisplay: string | undefined;
    // quoteFeesDisplay: string | undefined;
    // baseTokenLogoURI: string;
    // quoteTokenLogoURI: string;
    // baseTokenSymbol: string;
    // quoteTokenSymbol: string;

    // isDenomBase: boolean;

    controlItems: ItemIF[];
}

export default function PriceInfo(props: IPriceInfoProps) {
    const { limitOrder, controlItems } = props;
    const dispatch = useAppDispatch();
    const {
        usdValue,
        baseTokenSymbol,
        quoteTokenSymbol,
        isDenomBase,
        baseTokenLogo,
        quoteTokenLogo,
        lowPriceDisplay,
        highPriceDisplay,
        bidTick,
        askTick,
        positionLiqTotalUSD,

        baseDisplayFrontend,
        quoteDisplayFrontend,
        positionLiquidity,
    } = useProcessOrder(limitOrder);
    const data = useProcessOrder(limitOrder);
    console.log(data);

    const liquidityContent = (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.info_container}
        >
            <p>Liquidity</p>
            <Row>
                <div className={styles.align_center}>
                    <img src={baseTokenLogo} alt='' width='20px' />
                    {baseTokenSymbol}
                </div>

                <div className={styles.info_text}>{baseDisplayFrontend}</div>
            </Row>
            {/*  */}
            <Row>
                <div className={styles.align_center}>
                    <img src={quoteTokenLogo} alt='' width='20px' />
                    {quoteTokenSymbol}
                </div>
                <div className={styles.info_text}>{quoteDisplayFrontend}</div>
            </Row>
            {/*  */}
            <Divider />
            {/* <div className={styles.divider}></div> */}
            <Row>
                <span> Total Liquidity</span>
                <div className={styles.info_text}>
                    {positionLiqTotalUSD ? positionLiqTotalUSD.toFixed(2) : '...'}
                </div>
            </Row>
            <Row>
                <span> Liquidity Wei </span>
                <div className={styles.info_text}>
                    {positionLiquidity ? parseFloat(positionLiquidity).toFixed(2) : '...'}
                </div>
            </Row>
            {/*  */}
        </motion.div>
    );

    const tickContent = (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.info_container}
        >
            <Row>
                <span>Bid Tick</span>
                <div className={styles.info_text}>{bidTick}</div>
            </Row>

            <Row>
                <span>Ask Tick</span>
                <div className={styles.info_text}>{askTick}</div>
            </Row>
        </motion.div>
    );

    const totalValueContent = (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.info_container}
        >
            <Row>
                <span>Total Value</span>
                <div className={styles.info_text}>{usdValue}</div>
            </Row>
        </motion.div>
    );

    const tokenPairDetails = (
        <div
            className={styles.token_pair_details_container}
            onClick={() => {
                dispatch(toggleDidUserFlipDenom());
            }}
        >
            <div className={styles.token_pair_images}>
                <img src={isDenomBase ? baseTokenLogo : quoteTokenLogo} alt={baseTokenSymbol} />
                <img src={isDenomBase ? quoteTokenLogo : baseTokenLogo} alt={quoteTokenSymbol} />
            </div>
            <p>
                {isDenomBase ? baseTokenSymbol : quoteTokenSymbol} /{' '}
                {isDenomBase ? quoteTokenSymbol : baseTokenSymbol}
            </p>
        </div>
    );

    const minMaxPriceDipslay = (
        <div className={styles.min_max_price}>
            <div className={styles.min_max_content}>
                Min Price
                <span className={styles.min_price}>
                    {lowPriceDisplay ? parseFloat(lowPriceDisplay).toFixed(2) : 0}
                </span>
            </div>
            <div className={styles.min_max_content}>
                Max Price
                <span className={styles.max_price}>
                    {highPriceDisplay ? parseFloat(highPriceDisplay).toFixed(2) : 'Infinity'}
                </span>
            </div>
        </div>
    );
    // console.log(controlItems);

    return (
        <div className={styles.main_container}>
            <div className={styles.price_info_container}>
                {tokenPairDetails}
                {controlItems[2] && totalValueContent}
                {controlItems[0] && tickContent}
                {controlItems[1] && liquidityContent}
                {minMaxPriceDipslay}
            </div>
        </div>
    );
}
