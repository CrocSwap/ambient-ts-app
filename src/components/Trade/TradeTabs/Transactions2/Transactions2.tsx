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
        width: 60,
        readable: 'Timestamp',
    },
    txId: {
        width: 120,
        readable: 'ID',
    },
    txWallet: {
        width: 120,
        readable: 'Wallet',
    },
    txPrice: {
        width: 100,
        readable: 'Price',
    },
    txValue: {
        width: 100,
        readable: 'Value',
    },
    txSide: {
        width: 80,
        readable: 'Side',
    },
    txType: {
        width: 80,
        readable: 'Type',
    },
    txBase: {
        width: 100,
        readable: '',
    },
    txQuote: {
        width: 100,
        readable: '',
    },
    overflowBtn: {
        width: 30,
        readable: '',
    },
    editBtn: {
        width: 30,
        readable: '',
    },
    harvestBtn: {
        width: 30,
        readable: '',
    },
    addBtn: {
        width: 30,
        readable: '',
    },
    leafBtn: {
        width: 30,
        readable: '',
    },
    removeBtn: {
        width: 30,
        readable: '',
    },
    shareBtn: {
        width: 30,
        readable: '',
    },
    exportBtn: {
        width: 30,
        readable: '',
    },
    walletBtn: {
        width: 30,
        readable: '',
    },
    copyBtn: {
        width: 30,
        readable: '',
    },
    downloadBtn: {
        width: 30,
        readable: '',
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
        console.log('Re-running transactionsData');

        const output: TransactionIF[] = changesByPool.changes.filter(
            (tx: TransactionIF) =>
                tx.base.toLowerCase() === baseToken.address.toLowerCase() &&
                tx.quote.toLowerCase() === quoteToken.address.toLowerCase() &&
                tx.changeType !== 'fill' &&
                tx.changeType !== 'cross',
        );
        return output;
    }, [changesByPool]); //

    // ref holding the container in which we render the table, this gatekeeps code to render the
    // ... table until the container renders and tells us how much width (pixels) is available
    const containerRef = useRef<HTMLOListElement>(null);

    // list of columns to display in the DOM as determined by priority and space available
    // this is recalculated every time the elem changes width, but later memoization prevents
    // ... unnecessary re-renders from happening

    // array to define column priority in the DOM, columns listed last will be removed from the
    // ... DOM first when space is limited
    const priority: columnSlugsType[] = [
        'timeStamp',
        'txPrice',
        'txId',
        'txWallet',
        'txSide',
        'txType',
        'txValue',
        'txBase',
        'txQuote',
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
    const [containerWidth, setContainerWidth] = useState(1000);

    // Calculate columns to render
    const columnsToRender = useMemo(() => {
        const columnList: [columnSlugsType, number, string][] = [];
        let totalWidthNeeded = 0;

        for (let i = 0; i < priority.length; i++) {
            const columnId: columnSlugsType = priority[i];
            const columnSize: number = columnMetaInfo[columnId].width;
            const columnTitle: string = columnMetaInfo[columnId].readable;

            if (totalWidthNeeded + columnSize <= containerWidth) {
                columnList.push([columnId, columnSize, columnTitle]);
                totalWidthNeeded += columnSize;
            }
        }

        return columnList;
    }, [containerWidth]); // Dependency array includes containerWidth

    // Resize observer to update containerWidth state
    useEffect(() => {
        const adjustColumnization = () => {
            if (containerRef.current) {
                console.log(
                    'SETTING TARGET WIDTH' +
                        containerRef.current.clientWidth.toString(),
                );
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

    /*
     Old Render Method:
    const columnsToRender = useRef<[columnSlugsType, number, string][]>([]);
    useEffect(() => {
        console.log('RE-RENDER HAPPENING');
        if (isRendering==true)
        {
            console.log('RE-RENDER Skip');
            return;
        }
        isRendering = true;
        console.time('2Tracking-table');
        console.time('3Tracking-table');
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
        console.timeEnd('2Tracking-table');
        isRendering = false;
        console.log('RE-RENDER FINISH ');
        return () => {
            console.time('4Tracking-table');
            console.log('RE-RENDER FINISH1');
            resizeObserver.disconnect();
            console.timeEnd('4Tracking-table');
            console.timeEnd('3Tracking-table');
            console.log('RE-RENDER FINISH2');
        };
        
        
    }, []); */

    const [openMenuRow, setOpenMenuRow] = useState<string | null>(null);

    const handleMenuToggle = (rowId: string): void => {
        setOpenMenuRow((prevRowId) => (prevRowId === rowId ? null : rowId));
    };

    // array of row elements to render in the DOM, the base underlying data used for generation
    // ... is updated frequently but this memoization on recalculates if other items change

    const getHash = (tx: TransactionIF) => {
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

    const transactionRows = useMemo<JSX.Element[]>(
        () =>
            transactionsData.map((tx: TransactionIF) => {
                console.log('Re-running memo');
                console.log(
                    'Re-running memo' + transactionsData.length.toString(),
                );
                const txString = getHash(tx);
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
            }),
        [transactionsData.length, columnsToRender.length],
    );

    /*
    const transactionRows = transactionsData.map((tx: TransactionIF) => {
            console.log('Re-running without memo 2');
            const txString = getHash(tx); 
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
        });*/

    console.log('I should render here 2');
    console.log(transactionsData.length);
    console.log(transactionRows.length);
    console.log({ columnsToRender });

    return (
        <ol className={styles.tx_ol} ref={containerRef}>
            {<TxHeader activeColumns={columnsToRender} />}
            {transactionRows}
        </ol>
    );
    /* {transactionRows} />} */
}
