import styles from './NavItem.module.css';
import { useState } from 'react';

interface NavItemProps {
    children: React.ReactNode;
    icon: React.ReactNode;
}

export default function NavItem(props: NavItemProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className={styles.nav_item}>
            <a href='#' className={styles.icon_button} onClick={() => setOpen(!open)}>
                {props.icon}
            </a>

            {open && props.children}
        </div>
    );
}
