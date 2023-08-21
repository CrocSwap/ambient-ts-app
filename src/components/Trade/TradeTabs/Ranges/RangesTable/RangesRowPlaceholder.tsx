import { useContext } from 'react';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import trimString from '../../../../../utils/functions/trimString';
import { OptionButton } from '../../../../Global/Button/OptionButton';
import RangeStatus from '../../../../Global/RangeStatus/RangeStatus';
import styles from '../Ranges.module.css';
import { FiExternalLink } from 'react-icons/fi';
import { getPinnedPriceValuesFromTicks } from '../../../../../pages/Trade/Range/rangeFunctions';
import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';

interface PropsIF {
    transaction: {
        hash: string;
        side?: string;
        type: string;
        details?: {
            baseTokenDecimals: number;
            quoteTokenDecimals: number;
            lowTick: number;
            highTick: number;
            gridSize: number;
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

    const id = (
        <p className={`${styles.mono_font}`}>
            {trimString(transaction.hash, 6, 4, '…')}
        </p>
    );
    const wallet = (
        <p className={`${styles.id_style}`} style={{ textTransform: 'none' }}>
            you
        </p>
    );

    const pinnedDisplayPrices = transaction.details
        ? getPinnedPriceValuesFromTicks(
              isDenomBase,
              transaction.details.baseTokenDecimals,
              transaction.details.quoteTokenDecimals,
              transaction.details.lowTick,
              transaction.details.highTick,
              transaction.details.gridSize,
          )
        : undefined;

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
                        {pinnedDisplayPrices?.pinnedMinPriceDisplayTruncatedWithCommas ??
                            '...'}
                    </li>
                )}
                {!showColumns && (
                    <li className={styles.align_right}>
                        {pinnedDisplayPrices?.pinnedMaxPriceDisplayTruncatedWithCommas ??
                            '...'}
                    </li>
                )}
                {showColumns && !ipadView && (
                    <li className={styles.align_right}>
                        <p>
                            {pinnedDisplayPrices?.pinnedMinPriceDisplayTruncatedWithCommas ??
                                '...'}
                        </p>
                        <p>
                            {pinnedDisplayPrices?.pinnedMaxPriceDisplayTruncatedWithCommas ??
                                '...'}
                        </p>
                    </li>
                )}
                {<li className={styles.align_right}>...</li>}
                {<li className={styles.align_right}>...</li>}
                {<li className={styles.align_right}>...</li>}
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
