// START: Import React and Dongles
import { useEffect, useState } from 'react';

// START: Import JSX Elements
import styles from './Orders.module.css';
import OrderCard from './OrderCard';
import OrderCardHeader from './OrderCardHeader';

// START: Import Local Files
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { graphData } from '../../../../utils/state/graphDataSlice';

// interface for props for react functional component
interface propsIF {
    expandTradeTable: boolean;
    account: string;
    graphData: graphData;
}

// main react functional component
export default function Orders(props: propsIF) {
    const { expandTradeTable, account, graphData } = props;

    const limitOrders = graphData.limitOrdersByUser.limitOrders;

    const tradeData = useAppSelector((state) => state.tradeData);

    const selectedBaseToken = tradeData.baseToken.address.toLowerCase();
    const selectedQuoteToken = tradeData.quoteToken.address.toLowerCase();

    const isDenomBase = tradeData.isDenomBase;

    const columnHeaders = [
        {
            name: 'ID',
            sortable: true,
            className: '',
        },
        {
            name: 'Wallet',
            sortable: true,
            className: 'wallet',
        },
        {
            name: 'Price',
            sortable: true,
            className: 'price',
        },
        {
            name: 'Side',
            sortable: true,
            className: 'side',
        },
        {
            name: 'Type',
            sortable: true,
            className: 'type',
        },
        {
            name: 'Value',
            sortable: true,
            className: '',
        },
        {
            name: tradeData.baseToken.symbol,
            sortable: false,
            className: 'token',
        },
        {
            name: tradeData.quoteToken.symbol,
            sortable: false,
            className: 'token',
        },
    ];

    // TODO:   currently the values to determine sort order are not
    // TODO:   ... being used productively because there is only
    // TODO:   ... placeholder data, we will revisit this later on

    const [sortBy, setSortBy] = useState('default');
    const [reverseSort, setReverseSort] = useState(false);
    useEffect(() => {
        console.log({ sortBy, reverseSort });
    }, [sortBy, reverseSort]);

    const ItemContent = (
        <div className={styles.item_container}>
            {limitOrders.map((order, idx) => (
                <OrderCard
                    key={idx}
                    account={account}
                    limitOrder={order}
                    isDenomBase={isDenomBase}
                    selectedBaseToken={selectedBaseToken}
                    selectedQuoteToken={selectedQuoteToken}
                />
            ))}
        </div>
    );

    return (
        <div className={styles.container}>
            {/* <header >
                {columnHeaders.map((header) => (
                    <OrderCardHeader
                        key={`orderDataHeaderField${header.name}`}
                        data={header}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        reverseSort={reverseSort}
                        setReverseSort={setReverseSort}
                        columnHeaders={columnHeaders}
                    />
                ))}
            </header> */}
            <OrderCardHeader
                sortBy={sortBy}
                setSortBy={setSortBy}
                reverseSort={reverseSort}
                setReverseSort={setReverseSort}
                columnHeaders={columnHeaders}
            />
            <div
                className={styles.item_container}
                style={{ height: expandTradeTable ? '100%' : '170px' }}
            >
                {ItemContent}
            </div>
        </div>
    );
}
