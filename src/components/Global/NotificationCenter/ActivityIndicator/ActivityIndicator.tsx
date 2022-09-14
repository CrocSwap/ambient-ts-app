import { ReactNode } from 'react';
import styles from './ActivityIndicator.module.css';

interface ActivityIndicatorPropsIF {
    children: ReactNode;
}

export default function ActivityIndicator(props: ActivityIndicatorPropsIF) {
    const { children } = props;
    return <div className={styles.row}>{children}</div>;
}
