import styles from './Orders.module.css';
import OrderCard from './OrderCard';
import OrderCardHeader from './OrderCardHeader';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
// import { Dispatch, SetStateAction } from 'react';
interface OrdersProps {
    expandTradeTable: boolean;
    account: string;
    // setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
}
export default function Orders(props: OrdersProps) {
    const { expandTradeTable, account } = props;

    const tradeData = useAppSelector((state) => state.tradeData);

    const items = [1, 2, 3, 4, 5, 6];

    const columnHeaders = [
        {
            name: 'ID',
            sortable: true
        },
        {
            name: 'Wallet',
            sortable: true
        },
        {
            name: 'Price',
            sortable: true
        },
        {
            name: 'Side',
            sortable: true
        },
        {
            name: 'Type',
            sortable: true
        },
        {
            name: tradeData.baseToken.symbol,
            sortable: false
        },
        {
            name: tradeData.quoteToken.symbol,
            sortable: false
        }
    ];
    false && columnHeaders;

    const ItemContent = (
        <div className={styles.item_container}>
            {items.map((item, idx) => (
                <OrderCard key={idx} account={account} />
            ))}
        </div>
    );

    return (
        <div className={styles.container}>
            <header>
                {
                    columnHeaders.map(header => (
                        <OrderCardHeader
                            key={`orderDataHeaderField${header.name}`}
                            data={header}
                        />
                    ))
                }
            </header>
            <div
                className={styles.item_container}
                style={{ height: expandTradeTable ? '100%' : '170px' }}
            >
                {ItemContent}
            </div>
        </div>
    );
}
