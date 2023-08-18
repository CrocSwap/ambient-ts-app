import { useContext } from 'react';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import trimString from '../../../../../utils/functions/trimString';
import { OptionButton } from '../../../../Global/Button/OptionButton';
import RangeStatus from '../../../../Global/RangeStatus/RangeStatus';
import styles from '../Ranges.module.css';

interface PropsIF {
    transaction: {
        hash: string;
        side: string;
        type: string;
        details: {
            min?: string;
            max?: string;
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
                        {transaction.details.min}
                    </li>
                )}
                {!showColumns && (
                    <li className={styles.align_right}>
                        {transaction.details.max}
                    </li>
                )}
                {showColumns && !ipadView && (
                    <li className={styles.align_right}>
                        <p>{transaction.details.min}</p>
                        <p>{transaction.details.max}</p>
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
                            ariaLabel='Explore'
                            onClick={() =>
                                window.open(
                                    `${blockExplorer}tx/${transaction.hash}`,
                                )
                            }
                            content='Explore'
                        />
                    </div>
                </li>
            </ul>
        </>
    );
};
