import { ReactNode } from 'react';
import styles from './TransactionDetailsHeader.module.css';

interface TransactionDetailsHeaderPropsIF {
    children: ReactNode;
}

export default function TransactionDetailsHeader(props: TransactionDetailsHeaderPropsIF) {
    const { children } = props;
    return <div className={styles.row}>{children}</div>;
}
