import styles from './TransactionDetailsPriceInfo.module.css';
import Row from '../../../Global/Row/Row';
import { ITransaction } from '../../../../utils/state/graphDataSlice';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';
import Divider from '../../../Global/Divider/Divider';
import { motion } from 'framer-motion';
import { useProcessOrder } from '../../../../utils/hooks/useProcessOrder';
import { useProcessTransaction } from '../../../../utils/hooks/useProcessTransaction';

type ItemIF = {
    slug: string;
    name: string;
    checked: boolean;
};
interface ITransactionDetailsPriceInfoProps {
    tx: ITransaction;

    controlItems: ItemIF[];
}

export default function TransactionDetailsPriceInfo(props: ITransactionDetailsPriceInfoProps) {
    const { tx, controlItems } = props;
    const dispatch = useAppDispatch();
    const {
        usdValue,
        baseTokenSymbol,
        quoteTokenSymbol,
        isDenomBase,
        baseTokenLogo,
        quoteTokenLogo,
        // lowPriceDisplay,
        // highPriceDisplay,
        // bidTick,
        // askTick,
        // positionLiqTotalUSD,

        baseDisplayFrontend,
        quoteDisplayFrontend,
        // positionLiquidity,
    } = useProcessTransaction(tx);

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
    const fillTimeContent = (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.info_container}
        >
            <Row>
                <span>Fill Time</span>
                <div className={styles.info_text}>25/08/2022</div>
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
            <Row>
                <p>From:</p>
                <div>
                    1.69{' '}
                    <img
                        width='15px'
                        src={isDenomBase ? baseTokenLogo : quoteTokenLogo}
                        alt={baseTokenSymbol}
                    />
                </div>
            </Row>

            <Row>
                <p>To: </p>
                <div>
                    4,200.00{' '}
                    <img
                        width='15px'
                        src={isDenomBase ? quoteTokenLogo : baseTokenLogo}
                        alt={quoteTokenSymbol}
                    />
                </div>
            </Row>
        </div>
    );

    const PriceDipslay = (
        <div className={styles.min_max_price}>
            <div className={styles.min_max_content}>
                Min Price
                <span className={styles.min_price}>
                    {/* {lowPriceDisplay ? parseFloat(lowPriceDisplay).toFixed(2) : 0} */}
                </span>
            </div>
            <div className={styles.min_max_content}>
                Max Price
                <span className={styles.max_price}>
                    {/* {highPriceDisplay ? parseFloat(highPriceDisplay).toFixed(2) : 'Infinity'} */}
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
                {fillTimeContent}
                {PriceDipslay}
            </div>
        </div>
    );
}
