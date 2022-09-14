import { ReactNode } from 'react';
import styles from './NotificationTable.module.css';

interface NotificationTablePropsIF {
    children: ReactNode;
}

export default function NotificationTable(props: NotificationTablePropsIF) {
    const { children } = props;
    return <div className={styles.row}>{children}</div>;
}
