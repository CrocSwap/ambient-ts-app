import styles from './NavItem.module.css';
import { useState, useRef } from 'react';
import UseOnClickOutside from '../../../../utils/hooks/useOnClickOutside';
interface NavItemProps {
    children: React.ReactNode;
    icon: React.ReactNode;
}

export default function NavItem(props: NavItemProps) {
    const navItemRef = useRef<HTMLDivElement>(null);

    const [open, setOpen] = useState(false);

    const clickOutsideHandler = () => {
        setOpen(false);
    };
    UseOnClickOutside(navItemRef, clickOutsideHandler);
    return (
        <div className={styles.nav_item} ref={navItemRef}>
            <a href='#' className={styles.icon_button} onClick={() => setOpen(!open)}>
                {props.icon}
            </a>

            {open && props.children}
        </div>
    );
}
