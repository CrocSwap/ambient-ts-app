import styles from './DropdownMenu.module.css';
import { useState } from 'react';

interface DropdownMenuProps {
    children: React.ReactNode;
    title: string | React.ReactNode;
}

export default function DropdownMenu(props: DropdownMenuProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className={styles.nav_item}>
            <div className={styles.menu_icon} onClick={() => setOpen(!open)}>
                {props.title}
            </div>
            {open && props.children}
        </div>
    );
}
