import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import styles from './Transactions2.module.css';
import TransactionRow2 from './TransactionRow2';
import { CandleDataIF, TransactionIF } from '../../../../ambient-utils/types';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { GraphDataContext } from '../../../../contexts/GraphDataContext';

// columns to display in table and px width to alot for each
const columnsAndSizes = {
    timeStamp: 80,
    txId: 140,
    txWallet: 140,
    txValue: 140,
    txSide: 40,
    overflowBtn: 60,
    editBtn: 60,
    harvestBtn: 60,
    addBtn: 60,
    leafBtn: 60,
    removeBtn: 60,
    shareBtn: 60,
    exportBtn: 60,
    walletBtn: 60,
    copyBtn: 60,
    downloadBtn: 60,
};

// string-union type of all keys in the `columnsAndSizes` object
export type columnSlugsType = keyof typeof columnsAndSizes;

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
    const columnsToRender = useRef<[columnSlugsType, number][]>([]);

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
                const columnList: [columnSlugsType, number][] = [];
                // this value tracks how much width (pixels) is required by the columns in the
                // ... DOM, updated each time we iteratively add one
                let totalWidthNeeded = 0;
                // loop to add as many columns into the table as will fit per the priority array
                for (let i = 0; i < priority.length; i++) {
                    // get the name of the next column in the priority list
                    const columnId: columnSlugsType = priority[i];
                    // determine how much width (pixels) the column needs
                    const columnSize: number = columnsAndSizes[columnId];
                    // if the column fits in the DOM, add it to the list of columns to render
                    if (totalWidthNeeded + columnSize <= containerWidth) {
                        // push name of column into the output array
                        columnList.push([columnId, columnSize]);
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

    const handleMenuToggle = (rowId: string) => {
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
    console.log(columnsToRender.current);
    return (
        <ol className={styles.tx_ol} ref={containerRef}>
            {transactionRows}
        </ol>
    );
}
