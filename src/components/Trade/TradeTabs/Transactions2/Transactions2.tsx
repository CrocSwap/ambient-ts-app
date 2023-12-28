import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import styles from './Transactions2.module.css';
import TransactionRow2 from './TransactionRow2';
import { CandleDataIF, TransactionIF } from '../../../../ambient-utils/types';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { GraphDataContext } from '../../../../contexts/GraphDataContext';
import TxHeader from './TxHeader';

// columns to display in table and px width to alot for each
const columnMetaInfo = {
    timeStamp: {
        width: 80,
        readable: 'Timestamp'
    },
    txId: {
        width: 140,
        readable: 'ID'
    },
    txWallet: {
        width: 140,
        readable: 'Wallet'
    },
    txValue: {
        width: 140,
        readable: 'Value'
    },
    txSide: {
        width: 100,
        readable: 'Side'
    },
    overflowBtn: {
        width: 60,
        readable: ''
    },
    editBtn: {
        width: 60,
        readable: ''
    },
    harvestBtn: {
        width: 60,
        readable: ''
    },
    addBtn: {
        width: 60,
        readable: ''
    },
    leafBtn: {
        width: 60,
        readable: ''
    },
    removeBtn: {
        width: 60,
        readable: ''
    },
    shareBtn: {
        width: 60,
        readable: ''
    },
    exportBtn: {
        width: 60,
        readable: ''
    },
    walletBtn: {
        width: 60,
        readable: ''
    },
    copyBtn: {
        width: 60,
        readable: ''
    },
    downloadBtn: {
        width: 60,
        readable: ''
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
    const { changesByPool } = useContext(GraphDataContext);

    const transactionsData = useMemo<TransactionIF[]>(() => {
        const output: TransactionIF[] = changesByPool.changes.filter(
            (tx: TransactionIF) =>
                tx.base.toLowerCase() === baseToken.address.toLowerCase() &&
                tx.quote.toLowerCase() === quoteToken.address.toLowerCase() &&
                tx.changeType !== 'fill' &&
                tx.changeType !== 'cross',
        );
        return output;
    }, [changesByPool]);

    // ref holding the container in which we render the table, this gatekeeps code to render the
    // ... table until the container renders and tells us how much width (pixels) is available
    const containerRef = useRef<HTMLOListElement>(null);

    // list of columns to display in the DOM as determined by priority and space available
    // this is recalculated every time the elem changes width, but later memoization prevents
    // ... unnecessary re-renders from happening
    const columnsToRender = useRef<[columnSlugsType, number, string][]>([]);

    // array to define column priority in the DOM, columns listed last will be removed from the
    // ... DOM first when space is limited
    const priority: columnSlugsType[] = [
        'timeStamp',
        'txId',
        'txWallet',
        'txSide',
        'txValue',
        'overflowBtn',
        'editBtn',
        'harvestBtn',
        'addBtn',
        'leafBtn',
        'removeBtn',
        'shareBtn',
        'exportBtn',
        'walletBtn',
        'copyBtn',
        'downloadBtn',
    ];

    // add an observer to watch for element to be re-sized
    // later this should go to the parent so every table tab has it available
    useEffect(() => {
        // fn to log the width of the element in the DOM (number of pixels)
        function adjustColumnization() {
            // make sure the container in which we'll render the table exists
            if (containerRef.current) {
                // get the pixel width of the container in the DOM
                const containerWidth = containerRef.current.clientWidth;
                // array to hold the list of columns we'll actually render
                const columnList: [columnSlugsType, number, string][] = [];
                // this value tracks how much width (pixels) is required by the columns in the
                // ... DOM, updated each time we iteratively add one
                let totalWidthNeeded = 0;
                // loop to add as many columns into the table as will fit per the priority array
                for (let i = 0; i < priority.length; i++) {
                    // get the name of the next column in the priority list
                    const columnId: columnSlugsType = priority[i];
                    // determine how much width (pixels) the column needs
                    const columnSize: number = columnMetaInfo[columnId].width;
                    const columnTitle: string = columnMetaInfo[columnId].readable
                    // if the column fits in the DOM, add it to the list of columns to render
                    if (totalWidthNeeded + columnSize <= containerWidth) {
                        // push name of column into the output array
                        columnList.push([columnId, columnSize, columnTitle]);
                        // update the running total of column sizes needed
                        totalWidthNeeded += columnSize;
                    }
                }
                // send the output column list to local state, table will render responsively
                columnsToRender.current = columnList;
            }
        }

        // create an observer holding the width-logging function
        const resizeObserver: ResizeObserver = new ResizeObserver(
            adjustColumnization,
        );
        containerRef.current && resizeObserver.observe(containerRef.current);
        // cleanup the observer from the DOM when component dismounts
        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    const [openMenuRow, setOpenMenuRow] = useState<string | null>(null);

    const handleMenuToggle = (rowId: string): void => {
        setOpenMenuRow((prevRowId) => (prevRowId === rowId ? null : rowId));
    };

    // array of row elements to render in the DOM, the base underlying data used for generation
    // ... is updated frequently but this memoization on recalculates if other items change
    const transactionRows = useMemo<JSX.Element[]>(
        () =>
            transactionsData.map((tx: TransactionIF) => (
                <TransactionRow2
                    key={JSON.stringify(tx)}
                    tx={tx}
                    columnsToShow={columnsToRender.current}
                    isAccountPage={isAccountPage}
                    isMenuOpen={openMenuRow === JSON.stringify(tx)}
                    onMenuToggle={() => handleMenuToggle(JSON.stringify(tx))}
                    hideMenu={() => handleMenuToggle('')}
                />
            )),
        [columnsToRender.current.length, openMenuRow, transactionsData.length],
    );

    return (
        <ol className={styles.tx_ol} ref={containerRef}>
            <TxHeader activeColumns={columnsToRender.current} />
            {transactionRows}
        </ol>
    );
}
