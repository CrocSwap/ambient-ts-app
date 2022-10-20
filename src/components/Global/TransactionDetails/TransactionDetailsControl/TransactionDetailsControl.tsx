import { ReactNode } from 'react';
import styles from './TransactionDetailsControl.module.css';

interface TransactionDetailsControlPropsIF {
    children: ReactNode;
}

export default function TransactionDetailsControl(props: TransactionDetailsControlPropsIF) {
    const { children } = props;
    return <div className={styles.row}>{children}</div>;
}
