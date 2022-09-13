import { ReactNode } from 'react';
import styles from './IconWithTooltip.module.css';

interface IconWithTooltipPropsIF {
    children: ReactNode;
}

export default function IconWithTooltip(props: IconWithTooltipPropsIF) {
    const { children } = props;
    return <div className={styles.row}>{children}</div>;
}
