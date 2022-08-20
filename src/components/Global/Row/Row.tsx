import { ReactNode } from 'react';
import styles from './Row.module.css';

interface RowPropsIF {
    children: ReactNode;
}

export default function Row(props: RowPropsIF) {
    const { children } = props;
    return <div className={styles.row}>{children}</div>;
}
