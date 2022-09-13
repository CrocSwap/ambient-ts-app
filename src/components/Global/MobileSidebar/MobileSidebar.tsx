import { ReactNode } from 'react';
import styles from './MobileSidebar.module.css';

interface MobileSidebarPropsIF {
    children: ReactNode;
}

export default function MobileSidebar(props: MobileSidebarPropsIF) {
    const { children } = props;
    return <div className={styles.row}>{children}</div>;
}
