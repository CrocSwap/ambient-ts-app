import styles from './OrderGraphDisplay.module.css';
import OpenOrderStatus from '../../Global/OpenOrderStatus/OpenOrderStatus';
import { RiUser4Line } from 'react-icons/ri';
import TransactionDetailsGraph from '../../Global/TransactionDetails/TransactionDetailsGraph/TransactionDetailsGraph';
import { LimitOrderIF } from '../../../utils/interfaces/LimitOrderIF';
interface IOrderGraphDisplayProps {
    // updatedPositionApy: number | undefined;
    isOrderFilled: boolean;
    user: string;
    limitOrder: LimitOrderIF;
}
export default function OrderGraphDisplay(props: IOrderGraphDisplayProps) {
    const { isOrderFilled, user, limitOrder } = props;

    return (
        <div className={styles.main_container}>
            <div className={styles.top_details}>
                <div className={styles.user}>
                    <RiUser4Line size={28} color='' />
                    <p className={styles.user}>{user}</p>
                </div>
                <div className={styles.status}>
                    <p>Status :</p>
                    <OpenOrderStatus isFilled={isOrderFilled} />
                </div>
            </div>
            <div className={styles.chart_container}>
                <TransactionDetailsGraph tx={limitOrder} transactionType={'limitOrder'} />
            </div>
        </div>
    );
}
