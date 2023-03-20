import { ReactNode } from 'react';
import styles from './DropdownMenuContainer.module.css';

interface DropdownMenuContainerPropsIF {
    children: ReactNode;
}

export default function DropdownMenuContainer(props: DropdownMenuContainerPropsIF) {
    const { children } = props;
    return <div className={styles.dropdown}>{children}</div>;
}
