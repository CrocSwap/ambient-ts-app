import styles from './OrderGraphDisplay.module.css';
import chartImage from '../../../assets/images/Temporary/chart2.svg';
import OpenOrderStatus from '../../Global/OpenOrderStatus/OpenOrderStatus';
import { HiOutlineUserCircle } from 'react-icons/hi';

interface IOrderGraphDisplayProps {
    // updatedPositionApy: number | undefined;
    isOrderFilled: boolean;
    user: string;
}
export default function OrderGraphDisplay(props: IOrderGraphDisplayProps) {
    const { isOrderFilled, user } = props;

    return (
        <div className={styles.main_container}>
            <div className={styles.top_details}>
                <div className={styles.user}>
                    <HiOutlineUserCircle size={28} color='' />
                    <p className={styles.user}>{user}</p>
                </div>
                <div className={styles.status}>
                    <p>Order Status</p>
                    <OpenOrderStatus isFilled={isOrderFilled} />
                </div>
            </div>
            <div className={styles.chart_container}>
                <img src={chartImage} alt='chart' />
            </div>
        </div>
    );
}
