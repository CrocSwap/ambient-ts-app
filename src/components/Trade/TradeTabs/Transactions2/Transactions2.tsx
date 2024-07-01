import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import styles from './Transactions2.module.css';
import TransactionRow2 from './TransactionRow2';
import { CandleDataIF, TransactionIF } from '../../../../ambient-utils/types';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { GraphDataContext } from '../../../../contexts/GraphDataContext';
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
        width: 80,
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
        width: 60,
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
    txTokens: {
        width: 200,
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

    // when the table width changes, update the columns rendered in the DOM
    const columnsToRender = useMemo<columnMetaWithIdIF[]>(() => {
        // output variable
        const columnListForDOM: columnMetaWithIdIF[] = [];
        // running count of pixel-width needed by columns sent to the DOM
        let totalWidthNeeded = 0;
        // iterate through priority array and add columns to the DOM by order of importance
        for (let i = 0; i < priorityInDOM.length; i++) {
            // slug to identify the column
            const columnId: columnSlugsType = priorityInDOM[i];
            // retrieve and format data for that column from reference data
            const colData: columnMetaWithIdIF = { id: columnId, ...columnMetaInfo[columnId] };
            // determine if table has enough width to add the current column
            // YES ➞ add the column to output and increment the width accrued counter
            if (totalWidthNeeded + colData.width <= getContainerWidth()) {
                columnListForDOM.push(colData);
                totalWidthNeeded += colData.width;
            }
        }
        // return output variable with columns to place in the DOM
        return columnListForDOM;
    }, [getContainerWidth()]);

    // logic to open the overflow menu at the end of each `<li>` element
    const [openMenuRow, setOpenMenuRow] = useState<string | null>(null);
    const handleMenuToggle = (rowId: string): void => {
        setOpenMenuRow((prevRowId) => (prevRowId === rowId ? null : rowId));
    };

    // hook to sort transactions in the DOM
    const sortedTxs: useSortIF = useSort('timeStamp', transactionsData);

    // array of `<li>` elements to display transactions in the DOM, recalculates when new
    // ... data is received or the DOM width of the table changes
    const transactionRows = useMemo<JSX.Element>(() => {
        // slightly faster version of `JSON.stringify()` per Justin
        const makeString = (tx: TransactionIF): string => {
            let theId = tx.txId ? tx.txId.toString() : 'nullId';
            theId += tx.bidTick ? tx.bidTick.toString() : 'bidEmpty';
            theId += tx.askTick ? tx.askTick.toString() : 'askEmpty';
            theId += tx.txHash ? tx.txHash.toString() : 'txHash';
            return theId;
        };
        const header: JSX.Element|null = sortedTxs.data.length ? <TransactionRow2
        key={'table_header'}
        head={{
            updateSort: sortedTxs.update,
            overrides: {
                txBase: transactionsData[0]?.baseSymbol ?? 'Base Token',
                txQuote: transactionsData[0]?.quoteSymbol ?? 'Quote Token'
            }
        }}
        tx={sortedTxs.data[0]}
        columnsToShow={columnsToRender}
        isAccountPage={isAccountPage}
        isMenuOpen={openMenuRow === makeString(sortedTxs.data[0])}
        onMenuToggle={() => makeString(sortedTxs.data[0])}
        hideMenu={() => handleMenuToggle('')}
    /> : null;
        const rows: JSX.Element[] = sortedTxs.data.map((tx: TransactionIF) => {
            // make a key string for differencing (react and internal use)
            const txString: string = makeString(tx);
            // return a JSX element
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
        return (<>
            {header}
            {rows}
            </>
        );
    }, [JSON.stringify(sortedTxs), JSON.stringify(columnsToRender)]);

    return (
        <ol className={styles.tx_ol} ref={containerRef}>
            {transactionRows}
        </ol>
    );
}
