import OrdersMenu from './TableMenuComponents/OrdersMenu';
import RangesMenu from './TableMenuComponents/RangesMenu';
import TransactionsMenu from './TableMenuComponents/TransactionsMenu';

interface TableMenuProps {
    tableType: 'orders' | 'ranges' | 'transactions';
    userPosition: boolean | undefined;
}
export default function TableMenu(props: TableMenuProps) {
    const { tableType, userPosition } = props;
    const menuData = {
        orders: <OrdersMenu userPosition={userPosition} />,
        ranges: <RangesMenu />,
        transactions: <TransactionsMenu />,
    };

    return <>{menuData[tableType]}</>;
}
