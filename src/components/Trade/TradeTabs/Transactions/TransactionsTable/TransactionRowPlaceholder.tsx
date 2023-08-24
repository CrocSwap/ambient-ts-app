import { useContext } from 'react';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import trimString from '../../../../../utils/functions/trimString';
import { OptionButton } from '../../../../Global/Button/OptionButton';
import styles from '../Transactions.module.css';
import { FiExternalLink } from 'react-icons/fi';
import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';
import getUnicodeCharacter from '../../../../../utils/functions/getUnicodeCharacter';
import { getPinnedPriceValuesFromTicks } from '../../../../../pages/Trade/Range/rangeFunctions';
import { tickToPrice, toDisplayPrice } from '@crocswap-libs/sdk';
import { getFormattedNumber } from '../../../../../App/functions/getFormattedNumber';

interface PropsIF {
    transaction: {
        hash: string;
        side?: string;
        action?: string;
        type: string;
        details?: {
            baseSymbol?: string;
            quoteSymbol?: string;
            baseTokenDecimals?: number;
            quoteTokenDecimals?: number;
            isAmbient?: boolean;
            lowTick?: number;
            highTick?: number;
            isBid?: boolean;
            gridSize?: number;
        };
    };
    showTimestamp: boolean;
    showColumns: boolean;
    ipadView: boolean;
}

// TODO: integrate into TransactionRow
export const TransactionRowPlaceholder = (props: PropsIF) => {
    const { transaction, showTimestamp, showColumns, ipadView } = props;

    const { showAllData } = useContext(TradeTableContext);

    const { isDenomBase } = useAppSelector((state) => state.tradeData);

    const {
        chainData: { blockExplorer },
    } = useContext(CrocEnvContext);

    const baseTokenCharacter = transaction?.details?.baseSymbol
        ? getUnicodeCharacter(transaction.details.baseSymbol)
        : '';
    const quoteTokenCharacter = transaction?.details?.quoteSymbol
        ? getUnicodeCharacter(transaction.details.quoteSymbol)
        : '';

    const sideCharacter = isDenomBase
        ? baseTokenCharacter
        : quoteTokenCharacter;

    const priceCharacter = !isDenomBase
        ? baseTokenCharacter
        : quoteTokenCharacter;

    const id = (
        <p className={`${styles.mono_font}`}>
            {trimString(transaction.hash, 9, 0, '…')}
        </p>
    );
    const wallet = (
        <p className={`${styles.id_style}`} style={{ textTransform: 'none' }}>
            you
        </p>
    );

    const pinnedDisplayPrices =
        transaction.details?.baseTokenDecimals &&
        transaction.details?.quoteTokenDecimals &&
        transaction.details?.lowTick &&
        transaction.details?.highTick &&
        transaction.details?.gridSize
            ? getPinnedPriceValuesFromTicks(
                  isDenomBase,
                  transaction.details.baseTokenDecimals,
                  transaction.details.quoteTokenDecimals,
                  transaction.details.lowTick,
                  transaction.details.highTick,
                  transaction.details.gridSize,
              )
            : undefined;

    const limitPrice =
        transaction.details &&
        transaction.details.lowTick &&
        transaction.details.highTick
            ? transaction.side === 'Buy'
                ? tickToPrice(transaction.details.lowTick)
                : tickToPrice(transaction.details.highTick)
            : 0;

    const limitPriceDecimalCorrected = toDisplayPrice(
        limitPrice,
        transaction.details?.baseTokenDecimals ?? 18,
        transaction.details?.quoteTokenDecimals ?? 18,
    );

    const invLimitPriceDecimalCorrected = 1 / limitPriceDecimalCorrected;

    const limitPriceDecimalCorrectedTruncated = getFormattedNumber({
        value: limitPriceDecimalCorrected,
    });

    const invLimitPriceDecimalCorrectedTruncated = getFormattedNumber({
        value: invLimitPriceDecimalCorrected,
    });

    // TODO: use media queries and standardized styles
    return (
        <>
            <ul
                className={`${styles.row_placeholder} ${styles.row_container} ${
                    showAllData && styles.border_left
                }`}
                tabIndex={0}
            >
                {showTimestamp && (
                    <li>
                        <p>Now</p>
                    </li>
                )}
                {!showColumns && <li>{id}</li>}
                {!showColumns && <li>{wallet}</li>}
                {showColumns && (
                    <li>
                        {id}
                        {wallet}
                    </li>
                )}
                {!ipadView ? (
                    transaction.type === 'Range' ? (
                        <li className={styles.align_right}>
                            <p>
                                {transaction.details?.isAmbient
                                    ? '0.00'
                                    : `${priceCharacter}${
                                          pinnedDisplayPrices?.pinnedMinPriceDisplayTruncatedWithCommas ??
                                          '...'
                                      }`}
                            </p>
                            <p>
                                {transaction.details?.isAmbient
                                    ? '∞'
                                    : `${priceCharacter}${
                                          pinnedDisplayPrices?.pinnedMaxPriceDisplayTruncatedWithCommas ??
                                          '...'
                                      }`}
                            </p>
                        </li>
                    ) : transaction.type === 'Limit' ? (
                        <li className={styles.align_right}>
                            {isDenomBase
                                ? `${priceCharacter}${invLimitPriceDecimalCorrectedTruncated}`
                                : `${priceCharacter}${limitPriceDecimalCorrectedTruncated}`}
                        </li>
                    ) : (
                        <li className={styles.align_right}>...</li>
                    )
                ) : undefined}
                {!showColumns && (
                    <li className={styles.align_center}>
                        {transaction.type === 'Market' ||
                        transaction.type === 'Limit'
                            ? transaction.side === 'Claim'
                                ? 'Claim'
                                : transaction.side === 'Remove'
                                ? 'Remove'
                                : (!isDenomBase &&
                                      transaction.details?.isBid === true) ||
                                  (isDenomBase &&
                                      transaction.details?.isBid === false)
                                ? 'Buy' + ` ${sideCharacter}`
                                : 'Sell' + ` ${sideCharacter}`
                            : transaction.action ?? '...'}
                    </li>
                )}
                {!showColumns && (
                    <li className={styles.align_center}>{transaction.type}</li>
                )}
                {showColumns && !ipadView && (
                    <li
                        className={styles.align_center}
                        style={{ padding: '6px 0' }}
                    >
                        <p>{transaction.type}</p>
                        <p>
                            {transaction.type === 'Market' ||
                            transaction.type === 'Limit'
                                ? transaction.side === 'Claim'
                                    ? 'Claim'
                                    : transaction.side === 'Remove'
                                    ? 'Remove'
                                    : (!isDenomBase &&
                                          transaction.details?.isBid ===
                                              true) ||
                                      (isDenomBase &&
                                          transaction.details?.isBid === false)
                                    ? 'Buy' + ` ${sideCharacter}`
                                    : 'Sell' + ` ${sideCharacter}`
                                : transaction.action ?? '...'}
                        </p>
                    </li>
                )}
                {<li className={styles.align_right}>...</li>}
                {<li className={styles.align_right}>...</li>}
                {!showColumns && <li className={styles.align_right}>...</li>}
                <li
                    data-label='menu'
                    className={`${styles.menu} ${styles.align_right}`}
                >
                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                        }}
                    >
                        <OptionButton
                            ariaLabel='Explorer'
                            onClick={() =>
                                window.open(
                                    `${blockExplorer}tx/${transaction.hash}`,
                                )
                            }
                            content={
                                <>
                                    Explorer
                                    <FiExternalLink
                                        size={15}
                                        color='white'
                                        style={{ marginLeft: '.5rem' }}
                                    />
                                </>
                            }
                        />
                    </div>
                </li>
            </ul>
        </>
    );
};
