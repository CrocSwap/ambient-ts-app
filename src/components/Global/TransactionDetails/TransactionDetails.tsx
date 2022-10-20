import { ReactNode } from 'react';
import styles from './TransactionDetails.module.css';

interface TransactionDetailsPropsIF {
    children: ReactNode;
}

export default function TransactionDetails(props: TransactionDetailsPropsIF) {
    const { children } = props;
    return <div className={styles.row}>{children}</div>;
}
