import { useEffect, useRef, useState } from 'react';
import styles from './Transactions2.module.css';
import { sampleData } from './sampleData';
import TransactionRow2 from './TransactionRow2';
import { TransactionServerIF } from '../../../../utils/interfaces/TransactionIF';

// columns to display in table and px width to alot for each
const columnsAndSizes = {
    timeStamp: 60,
    txId: 110,
    txWallet: 120
};

// string-union type of all keys in the `columnsAndSizes` object
export type columnSlugsType = keyof typeof columnsAndSizes;

interface propsIF {
    isAccountPage: boolean;
}

export default function Transactions2(props: propsIF) {
    const { isAccountPage } = props;

    // ref holding the container in which we render the table, this gatekeeps code to render the
    // ... table until the container renders and tells us how much width (pixels) is available
    const containerRef = useRef<HTMLOListElement>(null);

    // list of columns to display in the DOM as determined by priority and space available
    const [columns, setColumns] = useState<[columnSlugsType, number][]>([]);

    // array to define column priority in the DOM, columns listed last will be removed from the
    // ... DOM first when space is limited
    const priority: columnSlugsType[] = [
        'timeStamp',
        'txId',
        'txWallet'
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
                    };
                }
                // send the output column list to local state, table will render responsively
                setColumns(columnList);
            }
        }

        // create an observer holding the width-logging function
        const resizeObserver: ResizeObserver = new ResizeObserver(adjustColumnization);
        containerRef.current && resizeObserver.observe(containerRef.current);

        // cleanup the observer from the DOM when component dismounts
        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <ol className={styles.tx_ol} ref={containerRef}>
            {
                sampleData.data.map((d: TransactionServerIF) => (
                    <TransactionRow2
                        key={JSON.stringify(d)}
                        tx={d}
                        columnsToShow={columns}
                        isAccountPage={isAccountPage}
                    />
                ))
            }
        </ol>
    );
}
