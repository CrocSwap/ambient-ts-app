import { ILimitOrderState } from '../../../../../utils/state/graphDataSlice';
import { IoIosCheckmarkCircleOutline } from 'react-icons/io';
import styles from '../Orders.module.css';

interface OrderRowPropsIF {
    showColumns: boolean;
    ipadView: boolean;
    // limitOrder: ILimitOrderState;
}
export default function OrderRow(props: OrderRowPropsIF) {
    const { showColumns, ipadView } = props;

    return (
        <ul>
            {!showColumns && <li data-label='id'>0x2345..</li>}
            {!showColumns && <li data-label='wallet'>BenWoslki.eth</li>}
            {showColumns && (
                <li data-label='id'>
                    <p>0x2345..</p> <p>BenWoslki.eth</p>
                </li>
            )}
            {!ipadView && <li data-label='price'>$1,597.23</li>}

            {!showColumns && <li data-label='side'>Sell</li>}
            {!showColumns && <li data-label='type'>Order</li>}
            {showColumns && !ipadView && (
                <li data-label='side-type'>
                    <p>Sell</p>
                    <p>Order</p>
                </li>
            )}
            <li data-label='value'> $12.11</li>
            {!showColumns && (
                <li data-label='eth'>
                    <p>0.00938</p>
                </li>
            )}
            {!showColumns && (
                <li data-label='usdc'>
                    {' '}
                    <p>$0.00</p>{' '}
                </li>
            )}
            {showColumns && (
                <li data-label='eth/usdc'>
                    <p style={{ display: 'flex', alignItems: 'center' }}>0.00938 </p> <p>$0.00</p>
                </li>
            )}
            {!ipadView && (
                <li data-label='status'>
                    <p>
                        <IoIosCheckmarkCircleOutline size={20} />
                    </p>
                </li>
            )}

            <li data-label='menu' style={{ width: showColumns ? '50px' : '200px' }}>
                <p className={styles.menu}>...</p>
            </li>
        </ul>
    );
}
