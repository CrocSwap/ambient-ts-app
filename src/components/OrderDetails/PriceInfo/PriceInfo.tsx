import styles from './PriceInfo.module.css';
import Row from '../../Global/Row/Row';
import { ILimitOrderState } from '../../../utils/state/graphDataSlice';

import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';
import Divider from '../../Global/Divider/Divider';
import { motion } from 'framer-motion';
import { useProcessOrder } from '../../../utils/hooks/useProcessOrder';
import { usePoolChartData } from '../../../state/pools/hooks';

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

    // controlItems: ItemIF[];
}

export default function PriceInfo(props: IPriceInfoProps) {
    const { limitOrder } = props;
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
        posLiqBaseDecimalCorrected,
        posLiqQuoteDecimalCorrected,
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
                <div>
                    <img src={baseTokenLogo} alt='' width='25px' />
                    {baseTokenSymbol}
                </div>

                <div className={styles.info_text}>{posLiqBaseDecimalCorrected}</div>
            </Row>
            {/*  */}
            <Row>
                <div>
                    <img src={quoteTokenLogo} alt='' width='25px' />
                    {quoteTokenSymbol}
                </div>
                <div className={styles.info_text}>{posLiqQuoteDecimalCorrected}</div>
            </Row>
            {/*  */}
            <Divider />
            {/* <div className={styles.divider}></div> */}
            <Row>
                <span> Liquidity Wei Qty</span>
                <div className={styles.info_text}>{positionLiquidity}</div>
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
                <span className={styles.min_price}>{lowPriceDisplay ?? 0}</span>
            </div>
            <div className={styles.min_max_content}>
                Max Price
                <span className={styles.max_price}>{highPriceDisplay ?? 'Infinity'}</span>
            </div>
        </div>
    );
    // console.log(controlItems);

    return (
        <div className={styles.main_container}>
            <div className={styles.price_info_container}>
                {tokenPairDetails}
                {true && totalValueContent}
                {true && tickContent}
                {true && liquidityContent}
                {minMaxPriceDipslay}
                {/* <div className={styles.graph_image_container}>
                    <img src={graphImage} alt='chart' />
                </div> */}
            </div>
        </div>
    );
}
