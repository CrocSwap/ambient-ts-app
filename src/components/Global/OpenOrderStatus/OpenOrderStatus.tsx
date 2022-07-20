import styles from './OpenOrderStatus.module.css';
import { AiOutlineCheck } from 'react-icons/ai';

interface OpenOrderStatusProps {
    isFilled: boolean;
    isAmbient?: boolean;
}

export default function OpenOrderStatus(props: OpenOrderStatusProps) {
    const nonFilled = <div className={styles.non_filled}></div>;

    const filled = (
        <div className={styles.filled}>
            <AiOutlineCheck color='#41D18E' size={15} />
        </div>
    );
    return <> {props.isFilled ? filled : nonFilled}</>;
}
