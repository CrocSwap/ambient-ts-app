import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import styles from './Transactions2.module.css';
import TransactionRow2 from './TransactionRow2';
import { CandleDataIF, TransactionIF } from '../../../../ambient-utils/types';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { GraphDataContext } from '../../../../contexts/GraphDataContext';
import TxHeader from './TxHeader';
import { priorityInDOM } from './data';
import useSort from './useSort';

// columns to display in table and px width to alot for each
const columnMetaInfo = {
    timeStamp: {
        width: 60,
        readable: 'Timestamp',
        sortable: true,
    },
    txId: {
        width: 120,
        readable: 'ID',
        sortable: false,
    },
    txWallet: {
        width: 120,
        readable: 'Wallet',
        sortable: true,
    },
    txPrice: {
        width: 100,
        readable: 'Price',
        sortable: false,
    },
    txValue: {
        width: 100,
        readable: 'Value',
        sortable: true,
    },
    txSide: {
        width: 80,
        readable: 'Side',
        sortable: false,
    },
    txType: {
        width: 80,
        readable: 'Type',
        sortable: false,
    },
    txBase: {
        width: 100,
        readable: '',
        sortable: false,
    },
    txQuote: {
        width: 100,
        readable: '',
        sortable: false,
    },
    overflowBtn: {
        width: 30,
        readable: '',
        sortable: false,
    },
    editBtn: {
        width: 30,
        readable: '',
        sortable: false,
    },
    harvestBtn: {
        width: 30,
        readable: '',
        sortable: false,
    },
    addBtn: {
        width: 30,
        readable: '',
        sortable: false,
    },
    leafBtn: {
        width: 30,
        readable: '',
        sortable: false,
    },
    removeBtn: {
        width: 30,
        readable: '',
        sortable: false,
    },
    shareBtn: {
        width: 30,
        readable: '',
        sortable: false,
    },
    exportBtn: {
        width: 30,
        readable: '',
        sortable: false,
    },
    walletBtn: {
        width: 30,
        readable: '',
        sortable: false,
    },
    copyBtn: {
        width: 30,
        readable: '',
        sortable: false,
    },
    downloadBtn: {
        width: 30,
        readable: '',
        sortable: false,
    },
};

// string-union type of all keys in the `columnsAndSizes` object
export type columnSlugsType = keyof typeof columnMetaInfo;

interface propsIF {
    isAccountPage: boolean;
    candleData: CandleDataIF | undefined;
}

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

    // list of columns to display in the DOM as determined by priority and space available
    // this is recalculated every time the elem changes width, but later memoization prevents
    // ... unnecessary re-renders from happening
    const containerWidthRef = useRef(0);
    const getContainerWidth = () => containerWidthRef.current;
    const setContainerWidth = (newWidth: number) => {
        containerWidthRef.current = newWidth;
    };

    // STEP 1: What is our target width, and how do we monitor it?
    useEffect(() => {
        const adjustColumnization = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.clientWidth);
            }
        };

        const resizeObserver = new ResizeObserver(adjustColumnization);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    // STEP 2: Given our target width, what columns do we want to show?
    const columnsToRender = useMemo<
        [columnSlugsType, number, string, boolean][]
    >(() => {
        const columnList: [columnSlugsType, number, string, boolean][] = [];
        let totalWidthNeeded = 0;

        for (let i = 0; i < priorityInDOM.length; i++) {
            const columnId: columnSlugsType = priorityInDOM[i];
            const columnSize: number = columnMetaInfo[columnId].width;
            const columnTitle: string = columnMetaInfo[columnId].readable;
            const isSortable: boolean = columnMetaInfo[columnId].sortable;

            if (totalWidthNeeded + columnSize <= getContainerWidth()) {
                columnList.push([
                    columnId,
                    columnSize,
                    columnTitle,
                    isSortable,
                ]);
                totalWidthNeeded += columnSize;
            }
        }

        return columnList;
    }, [getContainerWidth()]);

    const [openMenuRow, setOpenMenuRow] = useState<string | null>(null);

    const handleMenuToggle = (rowId: string): void => {
        setOpenMenuRow((prevRowId) => (prevRowId === rowId ? null : rowId));
    };

    const { sortedTransactions, updateSort } = useSort(transactionsData);
    console.log(sortedTransactions[0]?.txHash);

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
        return sortedTransactions.map((tx: TransactionIF) => {
            const txString = makeString(tx);
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
            <TxHeader activeColumns={columnsToRender} updateSort={updateSort} />
            {transactionRows}
        </ol>
    );
}
