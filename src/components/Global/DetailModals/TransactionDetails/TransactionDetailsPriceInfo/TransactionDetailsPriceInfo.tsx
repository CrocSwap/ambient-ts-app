import { AiOutlineLine } from 'react-icons/ai';
import { useProcessTransaction } from '../../../../../utils/hooks/useProcessTransaction';
import Row from '../../../Row/Row';
import styles from './TransactionDetailsPriceInfo.module.css';

import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { uriToHttp } from '../../../../../ambient-utils/dataLayer';
import { TokenIF, TransactionIF } from '../../../../../ambient-utils/types';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TokenContext } from '../../../../../contexts/TokenContext';
import { UserDataContext } from '../../../../../contexts/UserDataContext';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';
import { DefaultTooltip } from '../../../StyledTooltip/StyledTooltip';
import Apy from '../../../Tabs/Apy/Apy';
import TokenIcon from '../../../TokenIcon/TokenIcon';

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
    const showMobileVersion = useMediaQuery('(max-width: 768px)');

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
        <div
            className={`${styles.info_container}`}
            style={{ paddingBottom: showMobileVersion ? '16px' : '0' }}
        >
            <Row>
                <span>Order Value: </span>
                <DefaultTooltip
                    title={usdValue}
                    placement={'right'}
                    arrow
                    enterDelay={750}
                    leaveDelay={200}
                >
                    <div className={styles.info_text}>{usdValue}</div>
                </DefaultTooltip>
            </Row>
        </div>
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
        <div
            className={styles.info_container}
            style={{ paddingBottom: showMobileVersion ? '16px' : '0' }}
        >
            <Row>
                <span>Order Type: </span>
                <div className={styles.info_text}>{changeTypeDisplay}</div>
            </Row>
        </div>
    );

    const buyQuoteRow = (
        <div className={styles.info_container}>
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
        </div>
    );

    const sellBaseRow = (
        <div className={styles.info_container}>
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
        </div>
    );

    const buyBaseRow = (
        <div className={styles.info_container}>
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
        </div>
    );

    const sellQuoteRow = (
        <div className={styles.info_container}>
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
        </div>
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
                    {truncatedLowDisplayPriceDenomByMoneyness
                        ? baseTokenCharacter +
                          truncatedLowDisplayPriceDenomByMoneyness
                        : null}
                    {!truncatedDisplayPrice ? (
                        <AiOutlineLine style={{ paddingTop: '6px' }} />
                    ) : null}
                    {truncatedHighDisplayPriceDenomByMoneyness
                        ? baseTokenCharacter +
                          truncatedHighDisplayPriceDenomByMoneyness
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

    const orderValueBuy = isDenomBaseLocal
        ? isBuy
            ? sellBaseRow
            : buyBaseRow
        : isBuy
          ? buyQuoteRow
          : sellQuoteRow;

    const orderValueSell = isDenomBaseLocal
        ? isBuy
            ? buyQuoteRow
            : sellQuoteRow
        : isBuy
          ? sellBaseRow
          : buyBaseRow;

    return (
        <div className={styles.main_container}>
            <div className={styles.price_info_container}>
                {tokenPairDetails}
                {txTypeContent}
                {controlItems[2] && totalValueContent}
                <span className={styles.dividerMobile} />
                <>
                    {orderValueBuy}
                    {orderValueSell}
                </>
                <span className={styles.dividerMobile} />

                {PriceDisplay}

                {tx.entityType === 'liqchange' && positionApy !== 0 ? (
                    <Apy
                        amount={positionApy}
                        fs={showMobileVersion ? '22px' : '48px'}
                        lh={showMobileVersion ? '' : '60px'}
                        center
                        showTitle
                    />
                ) : undefined}
            </div>
        </div>
    );
}
