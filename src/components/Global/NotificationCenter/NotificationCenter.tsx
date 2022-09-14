import { ReactNode } from 'react';
import styles from './NotificationCenter.module.css';

interface NotificationCenterPropsIF {
    children: ReactNode;
}

export default function NotificationCenter(props: NotificationCenterPropsIF) {
    const { children } = props;
    return <div className={styles.row}>{children}</div>;
}
