import Apy from '../../Global/Tabs/Apy/Apy';
import styles from './APYGraphDisplay.module.css';
import { PositionIF } from '../../../utils/interfaces/PositionIF';
import TransactionDetailsGraph from '../../Global/TransactionDetails/TransactionDetailsGraph/TransactionDetailsGraph';

interface IApyGraphDisplayProps {
    updatedPositionApy: number | undefined;
    position: PositionIF;
}
export default function APYGraphDisplay(props: IApyGraphDisplayProps) {
    const { updatedPositionApy, position } = props;
    return (
        <div className={styles.main_container}>
            <div className={styles.apr}>
                <Apy amount={updatedPositionApy || undefined} />
                <p className={`${styles.apr_text} ${styles.apr_green}`}>APR</p>
            </div>
            <div className={styles.chart_container}>
                <TransactionDetailsGraph tx={position} transactionType={'liqchange'} />
            </div>
        </div>
    );
}
