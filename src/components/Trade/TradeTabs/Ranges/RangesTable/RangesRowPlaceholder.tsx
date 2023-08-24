import { useContext } from 'react';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import { OptionButton } from '../../../../Global/Button/OptionButton';
import RangeStatus from '../../../../Global/RangeStatus/RangeStatus';
import styles from '../Ranges.module.css';
import { FiExternalLink } from 'react-icons/fi';
import { getPinnedPriceValuesFromTicks } from '../../../../../pages/Trade/Range/rangeFunctions';
import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';
import getUnicodeCharacter from '../../../../../utils/functions/getUnicodeCharacter';
import { ambientPosSlot, concPosSlot } from '@crocswap-libs/sdk';
import { useAccount } from 'wagmi';
import trimString from '../../../../../utils/functions/trimString';

interface PropsIF {
    transaction: {
        hash: string;
        side?: string;
        type: string;
        details?: {
            baseAddress?: string;
            quoteAddress?: string;
            poolIdx?: number;
            baseSymbol?: string;
            quoteSymbol?: string;
            baseTokenDecimals?: number;
            quoteTokenDecimals?: number;
            isAmbient?: boolean;
            lowTick?: number;
            highTick?: number;
            gridSize?: number;
        };
    };
    showTimestamp: boolean;
    showColumns: boolean;
    mobileView: boolean;
    ipadView: boolean;
}

// TODO: integrate into RangesRow
export const RangesRowPlaceholder = (props: PropsIF) => {
    const { transaction, showTimestamp, showColumns, mobileView, ipadView } =
        props;

    const { showAllData } = useContext(TradeTableContext);
    const {
        chainData: { blockExplorer },
    } = useContext(CrocEnvContext);

    const { isDenomBase } = useAppSelector((state) => state.tradeData);

    const baseTokenCharacter = transaction?.details?.baseSymbol
        ? getUnicodeCharacter(transaction.details.baseSymbol)
        : '';
    const quoteTokenCharacter = transaction?.details?.quoteSymbol
        ? getUnicodeCharacter(transaction.details.quoteSymbol)
        : '';

    const priceCharacter = !isDenomBase
        ? baseTokenCharacter
        : quoteTokenCharacter;

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

    const isAmbient =
        transaction.details?.isAmbient ||
        (transaction.details?.lowTick === 0 &&
            transaction.details?.highTick === 0);

    // -------------------------------POSITION HASH------------------------

    const { address: userAddress } = useAccount();

    let posHash;
    if (isAmbient) {
        posHash = ambientPosSlot(
            userAddress ?? '',
            transaction.details?.baseAddress ?? '',
            transaction.details?.quoteAddress ?? '',
            transaction.details?.poolIdx ?? 0,
        );
    } else {
        posHash = transaction.details
            ? concPosSlot(
                  userAddress ?? '',
                  transaction.details?.baseAddress ?? '',
                  transaction.details?.quoteAddress ?? '',
                  transaction.details?.lowTick ?? 0,
                  transaction.details?.highTick ?? 0,
                  transaction.details?.poolIdx ?? 0,
              ).toString()
            : '…';
    }

    const id = (
        <p className={`${styles.mono_font}`}>
            {trimString(posHash.toString(), 9, 0, '…')}
        </p>
    );
    const wallet = (
        <p className={`${styles.id_style}`} style={{ textTransform: 'none' }}>
            you
        </p>
    );
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
                {!showColumns && (
                    <li className={styles.align_right}>
                        {isAmbient
                            ? '0.00'
                            : `${priceCharacter}${
                                  pinnedDisplayPrices?.pinnedMinPriceDisplayTruncatedWithCommas ??
                                  '...'
                              }`}
                    </li>
                )}
                {!showColumns && (
                    <li className={styles.align_right}>
                        {isAmbient
                            ? '∞'
                            : `${priceCharacter}${
                                  pinnedDisplayPrices?.pinnedMaxPriceDisplayTruncatedWithCommas ??
                                  '...'
                              }`}
                    </li>
                )}
                {showColumns && !ipadView && (
                    <li className={styles.align_right}>
                        <p>
                            {isAmbient
                                ? '0.00'
                                : `${priceCharacter}${
                                      pinnedDisplayPrices?.pinnedMinPriceDisplayTruncatedWithCommas ??
                                      '...'
                                  }`}
                        </p>
                        <p>
                            {isAmbient
                                ? '∞'
                                : `${priceCharacter}${
                                      pinnedDisplayPrices?.pinnedMaxPriceDisplayTruncatedWithCommas ??
                                      '...'
                                  }`}
                        </p>
                    </li>
                )}
                {<li className={styles.align_right}>...</li>}
                {<li className={styles.align_right}>...</li>}
                {!showColumns ? (
                    <li className={styles.align_right}>...</li>
                ) : undefined}
                {!mobileView && <li className={styles.align_right}>...</li>}
                {
                    <li className={styles.align_right}>
                        <RangeStatus
                            isInRange={false}
                            isAmbient={false}
                            isEmpty={true}
                            justSymbol
                        />
                    </li>
                }
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
                            padding: '2px',
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
