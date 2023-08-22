import { useContext } from 'react';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import trimString from '../../../../../utils/functions/trimString';
import { OptionButton } from '../../../../Global/Button/OptionButton';
import OpenOrderStatus from '../../../../Global/OpenOrderStatus/OpenOrderStatus';
import styles from '../Orders.module.css';
import { FiExternalLink } from 'react-icons/fi';
import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';
import getUnicodeCharacter from '../../../../../utils/functions/getUnicodeCharacter';

interface PropsIF {
    transaction: {
        hash: string;
        side?: string;
        type: string;
        baseSymbol: string;
        quoteSymbol: string;
    };
    showColumns: boolean;
    ipadView: boolean;
}

// TODO: integrate into OrderRow
export const OrderRowPlaceholder = (props: PropsIF) => {
    const { transaction, showColumns, ipadView } = props;

    const { showAllData } = useContext(TradeTableContext);
    const {
        chainData: { blockExplorer },
    } = useContext(CrocEnvContext);

    const { isDenomBase } = useAppSelector((state) => state.tradeData);

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

    const baseTokenCharacter = transaction.baseSymbol
        ? getUnicodeCharacter(transaction.baseSymbol)
        : '';
    const quoteTokenCharacter = transaction.quoteSymbol
        ? getUnicodeCharacter(transaction.quoteSymbol)
        : '';

    const sideCharacter = isDenomBase
        ? baseTokenCharacter
        : quoteTokenCharacter;

    // TODO: use media queries and standardized styles
    return (
        <>
            <ul
                className={`${styles.row_placeholder} ${styles.row_container} ${
                    showAllData && styles.border_left
                }`}
                tabIndex={0}
            >
                {!showColumns && (
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
                {!ipadView && <li className={styles.align_right}>...</li>}
                {!showColumns && (
                    <li className={styles.align_center}>
                        {(!isDenomBase && transaction.side === 'Buy') ||
                        (isDenomBase && transaction.side === 'Sell')
                            ? 'Buy' + ` ${sideCharacter}`
                            : 'Sell' + ` ${sideCharacter}`}
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
                            {(!isDenomBase && transaction.side === 'Buy') ||
                            (isDenomBase && transaction.side === 'Sell')
                                ? 'Buy'
                                : 'Sell'}
                        </p>
                    </li>
                )}
                {<li className={styles.align_right}>...</li>}
                {<li className={styles.align_right}>...</li>}
                {!showColumns && <li className={styles.align_right}>...</li>}
                {!ipadView && (
                    <li className={styles.align_center}>
                        <div
                            style={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                            }}
                        >
                            <OpenOrderStatus
                                isFilled={false}
                                isLimitOrderPartiallyFilled={false}
                                fillPercentage={0}
                            />
                        </div>
                    </li>
                )}
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
