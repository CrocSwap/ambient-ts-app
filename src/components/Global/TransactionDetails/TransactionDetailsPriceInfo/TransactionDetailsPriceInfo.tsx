import styles from './TransactionDetailsPriceInfo.module.css';
import Row from '../../../Global/Row/Row';
import { motion } from 'framer-motion';
import { useProcessTransaction } from '../../../../utils/hooks/useProcessTransaction';
import { AiOutlineLine } from 'react-icons/ai';

import { TokenIF, TransactionIF } from '../../../../utils/interfaces/exports';
import { useLocation } from 'react-router-dom';
import { DefaultTooltip } from '../../StyledTooltip/StyledTooltip';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import TokenIcon from '../../TokenIcon/TokenIcon';
import uriToHttp from '../../../../utils/functions/uriToHttp';
import Apy from '../../Tabs/Apy/Apy';
import { TokenContext } from '../../../../contexts/TokenContext';
import { useContext } from 'react';

type ItemIF = {
    slug: string;
    name: string;
    checked: boolean;
};

interface propsIF {
    tx: TransactionIF;
    controlItems: ItemIF[];
    positionApy: number | undefined;
}

export default function TransactionDetailsPriceInfo(props: propsIF) {
    const { tx, controlItems, positionApy } = props;
    const { addressCurrent: userAddress } = useAppSelector(
        (state) => state.userData,
    );

    const { tokens } = useContext(TokenContext);

    const {
        usdValue,
        baseTokenSymbol,
        quoteTokenSymbol,
        isDenomBase,
        baseTokenLogo,
        quoteTokenLogo,
        baseQuantityDisplay,
        quoteQuantityDisplay,
        estimatedBaseFlowDisplay,
        estimatedQuoteFlowDisplay,
        truncatedLowDisplayPrice,
        truncatedHighDisplayPrice,
        truncatedDisplayPrice,
        truncatedLowDisplayPriceDenomByMoneyness,
        truncatedHighDisplayPriceDenomByMoneyness,
        truncatedDisplayPriceDenomByMoneyness,
        isBaseTokenMoneynessGreaterOrEqual,
        baseTokenCharacter,
        quoteTokenCharacter,
        baseTokenAddress,
        quoteTokenAddress,
    } = useProcessTransaction(tx, userAddress);

    const baseToken: TokenIF | undefined =
        tokens.getTokenByAddress(baseTokenAddress);
    const quoteToken: TokenIF | undefined =
        tokens.getTokenByAddress(quoteTokenAddress);

    const { pathname } = useLocation();

    const isOnTradeRoute = pathname.includes('trade');

    const isBuy = tx.isBuy === true || tx.isBid === true;

    const tokenPairDetails = (
        <div className={styles.token_pair_details}>
            <div className={styles.token_pair_images}>
                <TokenIcon
                    token={baseToken}
                    src={uriToHttp(baseTokenLogo)}
                    alt={baseTokenSymbol}
                    size='2xl'
                />
                <TokenIcon
                    token={quoteToken}
                    src={uriToHttp(quoteTokenLogo)}
                    alt={quoteTokenSymbol}
                    size='2xl'
                />
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
                    title={usdValue}
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
            : 'Limit'
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
                <span>Order Type: </span>
                <div className={styles.info_text}>{typeDisplay}</div>
            </Row>
        </motion.div>
    );

    const buyQuoteRow = (
        <Row>
            <p>
                {tx.entityType === 'liqchange'
                    ? tx.quoteSymbol + ': '
                    : 'Buy: '}
            </p>
            <div>
                {tx.entityType !== 'limitOrder' || tx.changeType === 'recover'
                    ? quoteQuantityDisplay
                    : estimatedQuoteFlowDisplay || '0.00'}
                <TokenIcon
                    token={quoteToken}
                    src={uriToHttp(quoteTokenLogo)}
                    alt={quoteTokenSymbol}
                    size='xs'
                />
            </div>
        </Row>
    );
    const sellBaseRow = (
        <Row>
            <p>
                {tx.entityType === 'liqchange'
                    ? tx.baseSymbol + ': '
                    : 'Sell: '}
            </p>
            <div>
                {tx.entityType !== 'limitOrder' ||
                tx.changeType === 'burn' ||
                tx.changeType === 'mint'
                    ? baseQuantityDisplay
                    : estimatedBaseFlowDisplay || '0.00'}
                <TokenIcon
                    token={baseToken}
                    src={uriToHttp(baseTokenLogo)}
                    alt={baseTokenSymbol}
                    size='xs'
                />
            </div>
        </Row>
    );

    const isBuyTransactionDetails = (
        <div className={styles.tx_details}>
            {isDenomBase ? sellBaseRow : buyQuoteRow}
            <span className={styles.divider}></span>
            {isDenomBase ? buyQuoteRow : sellBaseRow}
        </div>
    );

    const buyBaseRow = (
        <Row>
            <p>
                {tx.entityType === 'liqchange' ? tx.baseSymbol + ': ' : 'Buy: '}
            </p>

            <div>
                {tx.entityType !== 'limitOrder' || tx.changeType === 'recover'
                    ? baseQuantityDisplay
                    : estimatedBaseFlowDisplay || '0.00'}
                <TokenIcon
                    token={baseToken}
                    src={uriToHttp(baseTokenLogo)}
                    alt={baseTokenSymbol}
                    size='xs'
                />
            </div>
        </Row>
    );

    const sellQuoteRow = (
        <Row>
            <p>
                {tx.entityType === 'liqchange'
                    ? tx.quoteSymbol + ': '
                    : 'Sell: '}
            </p>
            <div>
                {tx.entityType !== 'limitOrder' ||
                tx.changeType === 'burn' ||
                tx.changeType === 'mint'
                    ? quoteQuantityDisplay
                    : estimatedQuoteFlowDisplay || '0.00'}
                <TokenIcon
                    token={quoteToken}
                    src={uriToHttp(quoteTokenLogo)}
                    alt={quoteTokenSymbol}
                    size='xs'
                />
            </div>
        </Row>
    );

    const isSellTransactionDetails = (
        <div className={styles.tx_details}>
            {isDenomBase ? buyBaseRow : sellQuoteRow}
            <span className={styles.divider}></span>
            {isDenomBase ? sellQuoteRow : buyBaseRow}
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
                {tx.entityType === 'liqchange' ? (
                    <Apy
                        amount={positionApy || undefined}
                        fs='48px'
                        lh='60px'
                        center
                        showTitle
                    />
                ) : undefined}
            </div>
        </div>
    );
}
