import styles from './TransactionDetailsPriceInfo.module.css';
import Row from '../../../Global/Row/Row';
// import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
// import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';
import { motion } from 'framer-motion';
import { useProcessTransaction } from '../../../../utils/hooks/useProcessTransaction';
import { AiOutlineLine } from 'react-icons/ai';
import NoTokenIcon from '../../NoTokenIcon/NoTokenIcon';

// import { DefaultTooltip } from '../../StyledTooltip/StyledTooltip';
import { TransactionIF } from '../../../../utils/interfaces/exports';
import { useLocation } from 'react-router-dom';
import { DefaultTooltip } from '../../StyledTooltip/StyledTooltip';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';

type ItemIF = {
    slug: string;
    name: string;
    checked: boolean;
};

interface propsIF {
    tx: TransactionIF;
    controlItems: ItemIF[];
}

export default function TransactionDetailsPriceInfo(props: propsIF) {
    const { tx, controlItems } = props;
    const { addressCurrent: userAddress } = useAppSelector(
        (state) => state.userData,
    );

    // const dispatch = useAppDispatch();
    const {
        usdValue,
        baseTokenSymbol,
        quoteTokenSymbol,
        isDenomBase,
        baseTokenLogo,
        quoteTokenLogo,
        baseQuantityDisplayShort,
        quoteQuantityDisplayShort,
        truncatedLowDisplayPrice,
        truncatedHighDisplayPrice,
        truncatedDisplayPrice,
        truncatedLowDisplayPriceDenomByMoneyness,
        truncatedHighDisplayPriceDenomByMoneyness,
        truncatedDisplayPriceDenomByMoneyness,
        isBaseTokenMoneynessGreaterOrEqual,
        txUsdValueLocaleString,
        baseTokenCharacter,
        quoteTokenCharacter,
    } = useProcessTransaction(tx, userAddress);

    const { pathname } = useLocation();

    const isOnTradeRoute = pathname.includes('trade');

    const isBuy = tx.isBuy === true || tx.isBid === true;

    const tokenPairDetails = (
        <div
            className={styles.token_pair_details}
            onClick={() => {
                // dispatch(toggleDidUserFlipDenom());
            }}
        >
            <div className={styles.token_pair_images}>
                {/* <img src={baseTokenLogo} alt={baseTokenSymbol} /> */}
                {/* <img src={isDenomBase ? baseTokenLogo : quoteTokenLogo} alt={baseTokenSymbol} /> */}
                {baseTokenLogo ? (
                    <img src={baseTokenLogo} alt={baseTokenSymbol} />
                ) : (
                    <NoTokenIcon
                        tokenInitial={baseTokenSymbol?.charAt(0)}
                        width='30px'
                    />
                )}
                {quoteTokenLogo ? (
                    <img src={quoteTokenLogo} alt={quoteTokenSymbol} />
                ) : (
                    <NoTokenIcon
                        tokenInitial={quoteTokenSymbol?.charAt(0)}
                        width='30px'
                    />
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
                <DefaultTooltip
                    interactive
                    title={txUsdValueLocaleString}
                    placement={'right-end'}
                    arrow
                    enterDelay={750}
                    leaveDelay={200}
                >
                    <div className={styles.info_text}>{usdValue}</div>
                </DefaultTooltip>
            </Row>
        </motion.div>
    );

    const isAmbient = tx.positionType === 'ambient';

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

    const isBuyTransactionDetails = (
        <div className={styles.tx_details}>
            <Row>
                <p>
                    {tx.entityType === 'liqchange'
                        ? tx.quoteSymbol + ': '
                        : 'Buy: '}
                </p>

                <div>
                    {quoteQuantityDisplayShort.replace(/[()]/g, '')}

                    {quoteTokenLogo ? (
                        <img
                            width='15px'
                            src={quoteTokenLogo}
                            alt={quoteTokenSymbol}
                        />
                    ) : (
                        <NoTokenIcon
                            tokenInitial={quoteTokenSymbol?.charAt(0)}
                            width='15px'
                        />
                    )}
                </div>
            </Row>
            <span className={styles.divider}></span>
            <Row>
                <p>
                    {tx.entityType === 'liqchange'
                        ? tx.baseSymbol + ': '
                        : 'Sell: '}
                </p>
                <div>
                    {baseQuantityDisplayShort.replace(/[()]/g, '')}

                    {baseTokenLogo ? (
                        <img
                            width='15px'
                            src={baseTokenLogo}
                            alt={baseTokenSymbol}
                        />
                    ) : (
                        <NoTokenIcon
                            tokenInitial={baseTokenSymbol?.charAt(0)}
                            width='15px'
                        />
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
                <p>
                    {tx.entityType === 'liqchange'
                        ? tx.baseSymbol + ': '
                        : 'Buy: '}
                </p>

                <div>
                    {baseQuantityDisplayShort.replace(/[()]/g, '')}

                    {baseTokenLogo ? (
                        <img
                            width='15px'
                            src={baseTokenLogo}
                            alt={baseTokenSymbol}
                        />
                    ) : (
                        <NoTokenIcon
                            tokenInitial={baseTokenSymbol?.charAt(0)}
                            width='15px'
                        />
                    )}
                </div>
            </Row>
            <span className={styles.divider}></span>
            <Row>
                <p>
                    {tx.entityType === 'liqchange'
                        ? tx.quoteSymbol + ': '
                        : 'Sell: '}
                </p>
                <div>
                    {quoteQuantityDisplayShort.replace(/[()]/g, '')}

                    {quoteTokenLogo ? (
                        <img
                            width='15px'
                            src={quoteTokenLogo}
                            alt={quoteTokenSymbol}
                        />
                    ) : (
                        <NoTokenIcon
                            tokenInitial={quoteTokenSymbol?.charAt(0)}
                            width='15px'
                        />
                    )}
                </div>
            </Row>
        </div>
    );

    const PriceDisplay = (
        <div className={styles.min_max_price}>
            <p>{tx.entityType === 'liqchange' ? 'Price Range' : 'Price'}</p>
            {isAmbient ? (
                <span className={styles.min_price}>
                    {'0'}

                    <AiOutlineLine style={{ paddingTop: '6px' }} />

                    {'∞'}
                </span>
            ) : isOnTradeRoute ? (
                <span className={styles.min_price}>
                    {truncatedDisplayPrice
                        ? isDenomBase
                            ? quoteTokenCharacter + truncatedDisplayPrice
                            : baseTokenCharacter + truncatedDisplayPrice
                        : null}

                    {truncatedLowDisplayPrice
                        ? isDenomBase
                            ? quoteTokenCharacter + truncatedLowDisplayPrice
                            : baseTokenCharacter + truncatedLowDisplayPrice
                        : null}
                    {!truncatedDisplayPrice ? (
                        <AiOutlineLine style={{ paddingTop: '6px' }} />
                    ) : null}
                    {truncatedHighDisplayPrice
                        ? isDenomBase
                            ? quoteTokenCharacter + truncatedHighDisplayPrice
                            : baseTokenCharacter + truncatedHighDisplayPrice
                        : null}
                </span>
            ) : isBaseTokenMoneynessGreaterOrEqual ? (
                <span className={styles.min_price}>
                    {truncatedDisplayPriceDenomByMoneyness
                        ? baseTokenCharacter +
                          truncatedDisplayPriceDenomByMoneyness
                        : null}

                    {truncatedHighDisplayPriceDenomByMoneyness
                        ? baseTokenCharacter +
                          truncatedHighDisplayPriceDenomByMoneyness
                        : null}
                    {!truncatedDisplayPrice ? (
                        <AiOutlineLine style={{ paddingTop: '6px' }} />
                    ) : null}
                    {truncatedLowDisplayPriceDenomByMoneyness
                        ? baseTokenCharacter +
                          truncatedLowDisplayPriceDenomByMoneyness
                        : null}
                </span>
            ) : (
                <span className={styles.min_price}>
                    {truncatedDisplayPriceDenomByMoneyness
                        ? quoteTokenCharacter +
                          truncatedDisplayPriceDenomByMoneyness
                        : null}

                    {truncatedLowDisplayPriceDenomByMoneyness
                        ? quoteTokenCharacter +
                          truncatedLowDisplayPriceDenomByMoneyness
                        : null}
                    {!truncatedDisplayPrice ? (
                        <AiOutlineLine style={{ paddingTop: '6px' }} />
                    ) : null}
                    {truncatedHighDisplayPriceDenomByMoneyness
                        ? quoteTokenCharacter +
                          truncatedHighDisplayPriceDenomByMoneyness
                        : null}
                </span>
            )}
        </div>
    );

    return (
        <div className={styles.main_container}>
            <div className={styles.price_info_container}>
                {tokenPairDetails}
                {txTypeContent}
                {controlItems[2] && totalValueContent}
                {isBuy ? isBuyTransactionDetails : isSellTransactionDetails}
                {PriceDisplay}
            </div>
        </div>
    );
}
