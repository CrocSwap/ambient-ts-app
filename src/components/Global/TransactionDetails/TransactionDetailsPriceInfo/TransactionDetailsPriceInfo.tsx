import { ReactNode } from 'react';
import styles from './TransactionDetailsPriceInfo.module.css';

interface TransactionDetailsPriceInfoPropsIF {
    children: ReactNode;
}

export default function TransactionDetailsPriceInfo(props: TransactionDetailsPriceInfoPropsIF) {
    const { children } = props;
    return <div className={styles.row}>{children}</div>;
}
