import { ReactNode } from 'react';
import styles from './DropdownMenuItem.module.css';

interface DropdownMenuItemPropsIF {
    children: ReactNode;
}

export default function DropdownMenuItem(props: DropdownMenuItemPropsIF) {
    const { children } = props;
    return <li className={styles.menu_item}>{children}</li>;
}
