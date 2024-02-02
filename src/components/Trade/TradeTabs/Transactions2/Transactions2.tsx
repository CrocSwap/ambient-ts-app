import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import styles from './Transactions2.module.css';
import TransactionRow2 from './TransactionRow2';
import { CandleDataIF, TransactionIF } from '../../../../ambient-utils/types';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { GraphDataContext } from '../../../../contexts/GraphDataContext';
import TxHeader from './TxHeader';
import { priorityInDOM } from './data';
import useSort, { useSortIF } from './useSort';

interface singleColumnMetaIF {
    width: number;
    readable: string;
    isSortable: boolean;
};

interface allColumnMetaIF {
    [key: string]: singleColumnMetaIF;
};

// columns to display in table and px width to alot for each
const columnMetaInfo: allColumnMetaIF = {
    timeStamp: {
        width: 60,
        readable: 'Timestamp',
        isSortable: true,
    },
    txId: {
        width: 120,
        readable: 'ID',
        isSortable: false,
    },
    txWallet: {
        width: 120,
        readable: 'Wallet',
        isSortable: true,
    },
    txPrice: {
        width: 100,
        readable: 'Price',
        isSortable: false,
    },
    txValue: {
        width: 100,
        readable: 'Value',
        isSortable: true,
    },
    txSide: {
        width: 80,
        readable: 'Side',
        isSortable: false,
    },
    txType: {
        width: 80,
        readable: 'Type',
        isSortable: false,
    },
    txBase: {
        width: 100,
        readable: '',
        isSortable: false,
    },
    txQuote: {
        width: 100,
        readable: '',
        isSortable: false,
    },
    overflowBtn: {
        width: 30,
        readable: '',
        isSortable: false,
    },
    editBtn: {
        width: 30,
        readable: '',
        isSortable: false,
    },
    harvestBtn: {
        width: 30,
        readable: '',
        isSortable: false,
    },
    addBtn: {
        width: 30,
        readable: '',
        isSortable: false,
    },
    leafBtn: {
        width: 30,
        readable: '',
        isSortable: false,
    },
    removeBtn: {
        width: 30,
        readable: '',
        isSortable: false,
    },
    shareBtn: {
        width: 30,
        readable: '',
        isSortable: false,
    },
    exportBtn: {
        width: 30,
        readable: '',
        isSortable: false,
    },
    walletBtn: {
        width: 30,
        readable: '',
        isSortable: false,
    },
    copyBtn: {
        width: 30,
        readable: '',
        isSortable: false,
    },
    downloadBtn: {
        width: 30,
        readable: '',
        isSortable: false,
    },
};

// string-union type of all keys in the `columnsAndSizes` object
export type columnSlugsType = keyof typeof columnMetaInfo;
// interface for column metadata with the obj key embedded
export interface columnMetaWithIdIF extends singleColumnMetaIF {
    id: columnSlugsType;
};

interface propsIF {
    isAccountPage: boolean;
    candleData: CandleDataIF | undefined;
};

export default function Transactions2(props: propsIF) {
    const { isAccountPage, candleData } = props;
    false && candleData;
    // active token pair
    const { baseToken, quoteToken } = useContext(TradeDataContext);

    // tx data which will be used to render line items
    const { transactionsByPool } = useContext(GraphDataContext);

    const transactionsData = useMemo<TransactionIF[]>(() => {
        const output: TransactionIF[] = transactionsByPool.changes.filter(
            (tx: TransactionIF) =>
                tx.base.toLowerCase() === baseToken.address.toLowerCase() &&
                tx.quote.toLowerCase() === quoteToken.address.toLowerCase() &&
                tx.changeType !== 'fill' &&
                tx.changeType !== 'cross',
        );
        return output;
    }, [transactionsByPool]);

    // ref holding the container in which we render the table, this gatekeeps code to render the
    // ... table until the container renders and tells us how much width (pixels) is available
    const containerRef = useRef<HTMLOListElement>(null);

    // container width in which to fit DOM elements for the table
    const containerWidthRef = useRef(0);
    const getContainerWidth = () => containerWidthRef.current;
    const setContainerWidth = (newWidth: number) => {
        containerWidthRef.current = newWidth;
    };

    // add an observer to the DOM to watch for changes in table width
    useEffect(() => {
        // fn to update the memoized width available in the DOM
        const recordWidth = (): void => {
            containerRef.current && setContainerWidth(containerRef.current.clientWidth);
        }

        // create an observer and attach it to the DOM element being observed
        const resizeObserver = new ResizeObserver(recordWidth);
        containerRef.current && resizeObserver.observe(containerRef.current);

        // clean-up function
        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    // STEP 2: Given our target width, what columns do we want to show?
    const columnsToRender = useMemo<columnMetaWithIdIF[]>(() => {
        const columnList: columnMetaWithIdIF[] = [];
        let totalWidthNeeded = 0;

        for (let i = 0; i < priorityInDOM.length; i++) {
            const columnId: columnSlugsType = priorityInDOM[i];
            const colData: columnMetaWithIdIF = {
                id: columnId,
                ...columnMetaInfo[columnId]
            };

            if (totalWidthNeeded + colData.width <= getContainerWidth()) {
                columnList.push(colData);
                totalWidthNeeded += colData.width;
            }
        }

        return columnList;
    }, [getContainerWidth()]);

    const [openMenuRow, setOpenMenuRow] = useState<string | null>(null);

    const handleMenuToggle = (rowId: string): void => {
        setOpenMenuRow((prevRowId) => (prevRowId === rowId ? null : rowId));
    };

    const sortedTransactions: useSortIF = useSort('timeStamp', transactionsData);

    // array of row elements to render in the DOM, the base underlying data used for generation
    // ... is updated frequently but this memoization on recalculates if other items change

    // STEP 3: Given our columns, create a new transactions grid.
    const transactionRows = useMemo<JSX.Element[]>(() => {
        const makeString = (tx: TransactionIF): string => {
            // Slightly faster than JSON.stringify
            let theId = '';
            if (tx.txId) theId = theId + tx.txId.toString();
            else theId = theId + 'null_id';

            if (tx.askTick) theId = theId + tx.bidTick.toString();
            else theId = theId + 'bidEmpty';
            if (tx.askTick) theId = theId + tx.bidTick.toString();
            else theId = theId + 'askEmpty';

            if (tx.txHash) theId = theId + tx.txHash.toString();
            else theId = theId + 'txHash';
            return theId;
        };
        return sortedTransactions.data.map((tx: TransactionIF) => {
            const txString: string = makeString(tx);
            return (
                <TransactionRow2
                    key={txString}
                    tx={tx}
                    columnsToShow={columnsToRender}
                    isAccountPage={isAccountPage}
                    isMenuOpen={openMenuRow === txString}
                    onMenuToggle={() => handleMenuToggle(txString)}
                    hideMenu={() => handleMenuToggle('')}
                />
            );
        });
    }, [JSON.stringify(sortedTransactions), columnsToRender.length]);

    return (
        <ol className={styles.tx_ol} ref={containerRef}>
            <TxHeader activeColumns={columnsToRender} updateSort={sortedTransactions.update} />
            {transactionRows}
        </ol>
    );
}
