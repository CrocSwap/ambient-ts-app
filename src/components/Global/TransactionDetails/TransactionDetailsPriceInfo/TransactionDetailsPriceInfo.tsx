import styles from './TransactionDetailsPriceInfo.module.css';
import Row from '../../../Global/Row/Row';
import { motion } from 'framer-motion';
import { useProcessTransaction } from '../../../../utils/hooks/useProcessTransaction';
import { AiOutlineLine } from 'react-icons/ai';

import { TokenIF, TransactionIF } from '../../../../ambient-utils/types';
import { useLocation } from 'react-router-dom';
import { DefaultTooltip } from '../../StyledTooltip/StyledTooltip';
import TokenIcon from '../../TokenIcon/TokenIcon';
import { uriToHttp } from '../../../../ambient-utils/dataLayer';
import Apy from '../../Tabs/Apy/Apy';
import { TokenContext } from '../../../../contexts/TokenContext';
import { useContext } from 'react';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';

type ItemIF = {
    slug: string;
    name: string;
    checked: boolean;
};

interface propsIF {
    tx: TransactionIF;
    controlItems: ItemIF[];
    positionApy: number | undefined;
    isAccountView: boolean;
}

export default function TransactionDetailsPriceInfo(props: propsIF) {
    const { tx, controlItems, positionApy, isAccountView } = props;
    const { userAddress } = useContext(UserDataContext);
    const { crocEnv } = useContext(CrocEnvContext);

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
    } = useProcessTransaction(tx, userAddress, crocEnv);

    const baseToken: TokenIF | undefined =
        tokens.getTokenByAddress(baseTokenAddress);
    const quoteToken: TokenIF | undefined =
        tokens.getTokenByAddress(quoteTokenAddress);

    const { pathname } = useLocation();

    const isOnTradeRoute = pathname.includes('trade');

    const isBuy = tx.isBuy === true || tx.isBid === true;

    const baseIcon = (
        <TokenIcon
            token={baseToken}
            src={uriToHttp(baseTokenLogo)}
            alt={baseTokenSymbol}
            size='2xl'
        />
    );

    const quoteIcon = (
        <TokenIcon
            token={quoteToken}
            src={uriToHttp(quoteTokenLogo)}
            alt={quoteTokenSymbol}
            size='2xl'
        />
    );

    const isDenomBaseLocal = isAccountView
        ? !isBaseTokenMoneynessGreaterOrEqual
        : isDenomBase;

    const tokenPairDetails = (
        <div className={styles.token_pair_details}>
            <div className={styles.token_pair_images}>
                {isDenomBaseLocal ? baseIcon : quoteIcon}
                {isDenomBaseLocal ? quoteIcon : baseIcon}
            </div>
            <p>
                {isDenomBaseLocal ? baseTokenSymbol : quoteTokenSymbol} /{' '}
                {isDenomBaseLocal ? quoteTokenSymbol : baseTokenSymbol}
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
                <span>Order Value: </span>
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

    const changeType = tx.changeType;
    const entityType = tx.entityType;

    const changeTypeDisplay =
        changeType === 'harvest'
            ? 'Range Harvest'
            : changeType === 'mint'
            ? entityType === 'limitOrder'
                ? 'Limit'
                : 'Range'
            : changeType === 'burn'
            ? entityType === 'limitOrder'
                ? 'Limit Removal'
                : 'Range Removal'
            : changeType === 'recover'
            ? 'Limit Claim'
            : 'Market';

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
                <div className={styles.info_text}>{changeTypeDisplay}</div>
            </Row>
        </motion.div>
    );

    const buyQuoteRow = (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.info_container}
        >
            <Row>
                <p>
                    {tx.entityType === 'liqchange'
                        ? tx.quoteSymbol + ': '
                        : tx.changeType === 'burn'
                        ? tx.quoteSymbol + ' Claimed: '
                        : 'Buy: '}
                </p>
                <div className={styles.info_text}>
                    {tx.entityType !== 'limitOrder' ||
                    tx.changeType === 'recover' ||
                    tx.changeType === 'burn'
                        ? quoteQuantityDisplay
                        : estimatedQuoteFlowDisplay || '0.00'}
                    <TokenIcon
                        token={quoteToken}
                        src={uriToHttp(quoteTokenLogo)}
                        alt={quoteTokenSymbol}
                        size='s'
                    />
                </div>
            </Row>
        </motion.div>
    );

    const sellBaseRow = (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.info_container}
        >
            <Row>
                <p>
                    {tx.entityType === 'liqchange'
                        ? tx.baseSymbol + ': '
                        : tx.changeType === 'burn'
                        ? tx.baseSymbol + ' Removed: '
                        : 'Sell: '}
                </p>
                <div className={styles.info_text}>
                    {tx.entityType !== 'limitOrder' ||
                    tx.changeType === 'burn' ||
                    tx.changeType === 'mint'
                        ? baseQuantityDisplay
                        : estimatedBaseFlowDisplay || '0.00'}
                    <TokenIcon
                        token={baseToken}
                        src={uriToHttp(baseTokenLogo)}
                        alt={baseTokenSymbol}
                        size='s'
                    />
                </div>
            </Row>
        </motion.div>
    );

    const buyBaseRow = (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.info_container}
        >
            <Row>
                <p>
                    {tx.entityType === 'liqchange'
                        ? tx.baseSymbol + ': '
                        : tx.changeType === 'burn'
                        ? tx.baseSymbol + ' Claimed: '
                        : 'Buy: '}
                </p>
                <div className={styles.info_text}>
                    {tx.entityType !== 'limitOrder' ||
                    tx.changeType === 'recover' ||
                    tx.changeType === 'burn'
                        ? baseQuantityDisplay
                        : estimatedBaseFlowDisplay || '0.00'}
                    <TokenIcon
                        token={baseToken}
                        src={uriToHttp(baseTokenLogo)}
                        alt={baseTokenSymbol}
                        size='s'
                    />
                </div>
            </Row>
        </motion.div>
    );

    const sellQuoteRow = (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.info_container}
        >
            <Row>
                <p>
                    {tx.entityType === 'liqchange'
                        ? tx.quoteSymbol + ': '
                        : tx.changeType === 'burn'
                        ? tx.quoteSymbol + ' Removed: '
                        : 'Sell: '}
                </p>
                <div className={styles.info_text}>
                    {tx.entityType !== 'limitOrder' ||
                    tx.changeType === 'burn' ||
                    tx.changeType === 'mint'
                        ? quoteQuantityDisplay
                        : estimatedQuoteFlowDisplay || '0.00'}
                    <TokenIcon
                        token={quoteToken}
                        src={uriToHttp(quoteTokenLogo)}
                        alt={quoteTokenSymbol}
                        size='s'
                    />
                </div>
            </Row>
        </motion.div>
    );

    const PriceDisplay = (
        <div className={styles.min_max_price}>
            <p>
                {tx.entityType === 'liqchange'
                    ? 'Price Range'
                    : tx.entityType === 'limitOrder'
                    ? 'Limit Price'
                    : 'Price'}
            </p>
            {isAmbient ? (
                <span className={styles.min_price}>
                    {'0'}

                    <AiOutlineLine style={{ paddingTop: '6px' }} />

                    {'∞'}
                </span>
            ) : isOnTradeRoute ? (
                <span className={styles.min_price}>
                    {truncatedDisplayPrice
                        ? isDenomBaseLocal
                            ? quoteTokenCharacter + truncatedDisplayPrice
                            : baseTokenCharacter + truncatedDisplayPrice
                        : null}

                    {truncatedLowDisplayPrice
                        ? isDenomBaseLocal
                            ? quoteTokenCharacter + truncatedLowDisplayPrice
                            : baseTokenCharacter + truncatedLowDisplayPrice
                        : null}
                    {!truncatedDisplayPrice ? (
                        <AiOutlineLine style={{ paddingTop: '6px' }} />
                    ) : null}
                    {truncatedHighDisplayPrice
                        ? isDenomBaseLocal
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
                {isDenomBaseLocal
                    ? isBuy
                        ? sellBaseRow
                        : buyBaseRow
                    : isBuy
                    ? buyQuoteRow
                    : sellQuoteRow}
                {isDenomBaseLocal
                    ? isBuy
                        ? buyQuoteRow
                        : sellQuoteRow
                    : isBuy
                    ? sellBaseRow
                    : buyBaseRow}
                {controlItems[2] && totalValueContent}
                {PriceDisplay}
                {tx.entityType === 'liqchange' && positionApy !== 0 ? (
                    <Apy
                        amount={positionApy}
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
