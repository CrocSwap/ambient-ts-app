import styles from './TransactionDetailsPriceInfo.module.css';
import Row from '../../../Global/Row/Row';
import { ITransaction } from '../../../../utils/state/graphDataSlice';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';
import { motion } from 'framer-motion';
import { useProcessTransaction } from '../../../../utils/hooks/useProcessTransaction';
import { AiOutlineDash } from 'react-icons/ai';

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
        truncatedLowDisplayPrice,
        truncatedHighDisplayPrice,
        // positionLiquidity,
    } = useProcessTransaction(tx);

    const tokenPairDetails = (
        <div
            className={styles.token_pair_details}
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

    const transactionDetails = (
        <div
            className={styles.tx_details}
            onClick={() => {
                dispatch(toggleDidUserFlipDenom());
            }}
        >
            <Row>
                <p>From:</p>
                <div>
                    {baseDisplayFrontend}
                    <img
                        width='15px'
                        src={isDenomBase ? baseTokenLogo : quoteTokenLogo}
                        alt={baseTokenSymbol}
                    />
                </div>
            </Row>
            <span className={styles.divider}></span>
            <Row>
                <p>To: </p>
                <div>
                    {quoteDisplayFrontend}
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
            <p>Price</p>

            <span className={styles.min_price}>
                {truncatedLowDisplayPrice} <AiOutlineDash />
                {truncatedHighDisplayPrice}
            </span>
        </div>
    );
    // console.log(controlItems);

    return (
        <div className={styles.main_container}>
            <div className={styles.price_info_container}>
                {tokenPairDetails}
                {controlItems[2] && totalValueContent}
                {fillTimeContent}
                {transactionDetails}
                {PriceDipslay}
            </div>
        </div>
    );
}
