import styles from './TransactionDetailsPriceInfo.module.css';
import Row from '../../../Global/Row/Row';
import { ITransaction } from '../../../../utils/state/graphDataSlice';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';
import { motion } from 'framer-motion';
import { useProcessTransaction } from '../../../../utils/hooks/useProcessTransaction';
import { AiOutlineDash } from 'react-icons/ai';
import NoTokenIcon from '../../NoTokenIcon/NoTokenIcon';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import { useMemo } from 'react';
import { DefaultTooltip } from '../../StyledTooltip/StyledTooltip';
// import TooltipComponent from '../../TooltipComponent/TooltipComponent';

type ItemIF = {
    slug: string;
    name: string;
    checked: boolean;
};
interface ITransactionDetailsPriceInfoProps {
    account: string;
    tx: ITransaction;

    controlItems: ItemIF[];
}

export default function TransactionDetailsPriceInfo(props: ITransactionDetailsPriceInfoProps) {
    const { account, tx, controlItems } = props;
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

        // baseDisplay,
        // quoteDisplay,
        baseDisplayFrontend,
        quoteDisplayFrontend,
        // truncatedLowDisplayPrice,
        // truncatedHighDisplayPrice,
        truncatedDisplayPrice,
        truncatedLowDisplayPriceDenomByMoneyness,
        truncatedHighDisplayPriceDenomByMoneyness,
        truncatedDisplayPriceDenomByMoneyness,
        isBaseTokenMoneynessGreaterOrEqual,
        // positionLiquidity,
    } = useProcessTransaction(tx, account);

    const isBuy = tx.isBuy === true || tx.isBid === true;

    const tokenPairDetails = (
        <div
            className={styles.token_pair_details}
            onClick={() => {
                dispatch(toggleDidUserFlipDenom());
            }}
        >
            <div className={styles.token_pair_images}>
                {/* <img src={baseTokenLogo} alt={baseTokenSymbol} /> */}
                {/* <img src={isDenomBase ? baseTokenLogo : quoteTokenLogo} alt={baseTokenSymbol} /> */}
                {baseTokenLogo ? (
                    <img src={baseTokenLogo} alt={baseTokenSymbol} />
                ) : (
                    <NoTokenIcon tokenInitial={baseTokenSymbol.charAt(0)} width='30px' />
                )}
                {quoteTokenLogo ? (
                    <img src={quoteTokenLogo} alt={quoteTokenSymbol} />
                ) : (
                    <NoTokenIcon tokenInitial={quoteTokenSymbol.charAt(0)} width='30px' />
                )}
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
                <span>Total Value: </span>
                <div className={styles.info_text}>{usdValue}</div>
            </Row>
        </motion.div>
    );

    const typeDisplay = tx.entityType
        ? tx.entityType === 'swap'
            ? 'Market'
            : tx.entityType === 'liqchange'
            ? tx.changeType === 'mint'
                ? 'Add to Range'
                : 'Remove from Range'
            : 'Limit Order'
        : '...';

    const txTypeContent = (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.info_container}
        >
            <Row>
                <span>Type: </span>
                <div className={styles.info_text}>{typeDisplay}</div>
            </Row>
        </motion.div>
    );

    // const fillTime = new Intl.DateTimeFormat('en-US', {
    //     year: 'numeric',
    //     month: '2-digit',
    //     day: '2-digit',
    //     hour: '2-digit',
    //     minute: '2-digit',
    //     second: '2-digit',
    // }).format(tx.time);

    const fillTime = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
    }).format(tx.time * 1000);

    const fillDate = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(tx.time * 1000);

    const fillTimeContent = (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.info_container}
        >
            <Row>
                <DefaultTooltip
                    interactive
                    title={'Block: ' + tx.block}
                    placement={'right'}
                    arrow
                    enterDelay={750}
                    leaveDelay={200}
                >
                    <div className={styles.info_text}>{fillDate}</div>
                </DefaultTooltip>
                <DefaultTooltip
                    interactive
                    title={'Block: ' + tx.block}
                    placement={'right'}
                    arrow
                    enterDelay={750}
                    leaveDelay={200}
                >
                    <div className={styles.info_text}>{fillTime}</div>
                </DefaultTooltip>

                {/* <span>Date: </span> */}
            </Row>

            {/* <Row> */}
            {/* <span>Time: </span> */}
            {/* </Row> */}
        </motion.div>
    );

    const isBuyTransactionDetails = (
        <div
            className={styles.tx_details}
            // onClick={() => {
            // dispatch(toggleDidUserFlipDenom());
            // }}
        >
            <Row>
                <p>{tx.entityType === 'liqchange' ? tx.quoteSymbol + ': ' : 'Buy: '}</p>

                <div>
                    {quoteDisplayFrontend.replace(/[()]/g, '')}

                    {quoteTokenLogo ? (
                        <img width='15px' src={quoteTokenLogo} alt={quoteTokenSymbol} />
                    ) : (
                        <NoTokenIcon tokenInitial={quoteTokenSymbol.charAt(0)} width='15px' />
                    )}
                </div>
            </Row>
            <span className={styles.divider}></span>
            <Row>
                <p>{tx.entityType === 'liqchange' ? tx.baseSymbol + ': ' : 'Sell: '}</p>
                <div>
                    {baseDisplayFrontend.replace(/[()]/g, '')}

                    {baseTokenLogo ? (
                        <img width='15px' src={baseTokenLogo} alt={baseTokenSymbol} />
                    ) : (
                        <NoTokenIcon tokenInitial={baseTokenSymbol.charAt(0)} width='15px' />
                    )}
                </div>
            </Row>
        </div>
    );

    const isSellTransactionDetails = (
        <div
            className={styles.tx_details}
            // onClick={() => {
            // dispatch(toggleDidUserFlipDenom());
            // }}
        >
            <Row>
                <p>{tx.entityType === 'liqchange' ? tx.baseSymbol + ': ' : 'Buy: '}</p>

                <div>
                    {baseDisplayFrontend.replace(/[()]/g, '')}

                    {baseTokenLogo ? (
                        <img width='15px' src={baseTokenLogo} alt={baseTokenSymbol} />
                    ) : (
                        <NoTokenIcon tokenInitial={baseTokenSymbol.charAt(0)} width='15px' />
                    )}
                </div>
            </Row>
            <span className={styles.divider}></span>
            <Row>
                <p>{tx.entityType === 'liqchange' ? tx.quoteSymbol + ': ' : 'Sell: '}</p>
                <div>
                    {quoteDisplayFrontend.replace(/[()]/g, '')}

                    {quoteTokenLogo ? (
                        <img width='15px' src={quoteTokenLogo} alt={quoteTokenSymbol} />
                    ) : (
                        <NoTokenIcon tokenInitial={quoteTokenSymbol.charAt(0)} width='15px' />
                    )}
                </div>
            </Row>
        </div>
    );

    const baseCharacter = useMemo(() => getUnicodeCharacter(tx.baseSymbol), [tx.baseSymbol]);
    const quoteCharacter = useMemo(() => getUnicodeCharacter(tx.quoteSymbol), [tx.quoteSymbol]);

    const PriceDisplay = (
        <div className={styles.min_max_price}>
            <p>{tx.entityType === 'liqchange' ? 'Price Range' : 'Price'}</p>

            {isBaseTokenMoneynessGreaterOrEqual ? (
                <span className={styles.min_price}>
                    {truncatedDisplayPriceDenomByMoneyness
                        ? baseCharacter + truncatedDisplayPriceDenomByMoneyness
                        : null}

                    {truncatedHighDisplayPriceDenomByMoneyness
                        ? baseCharacter + truncatedHighDisplayPriceDenomByMoneyness
                        : null}
                    {!truncatedDisplayPrice ? <AiOutlineDash /> : null}
                    {truncatedLowDisplayPriceDenomByMoneyness
                        ? baseCharacter + truncatedLowDisplayPriceDenomByMoneyness
                        : null}
                </span>
            ) : (
                <span className={styles.min_price}>
                    {truncatedDisplayPriceDenomByMoneyness
                        ? quoteCharacter + truncatedDisplayPriceDenomByMoneyness
                        : null}

                    {truncatedLowDisplayPriceDenomByMoneyness
                        ? quoteCharacter + truncatedLowDisplayPriceDenomByMoneyness
                        : null}
                    {!truncatedDisplayPrice ? <AiOutlineDash /> : null}
                    {truncatedHighDisplayPriceDenomByMoneyness
                        ? quoteCharacter + truncatedHighDisplayPriceDenomByMoneyness
                        : null}
                </span>
            )}
        </div>
    );
    // console.log(controlItems);

    return (
        <div className={styles.main_container}>
            <div className={styles.price_info_container}>
                {tokenPairDetails}
                {txTypeContent}
                {fillTimeContent}
                {controlItems[2] && totalValueContent}
                {isBuy ? isBuyTransactionDetails : isSellTransactionDetails}
                {PriceDisplay}
            </div>
        </div>
    );
}
