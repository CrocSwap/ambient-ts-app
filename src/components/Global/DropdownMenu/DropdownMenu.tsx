import styles from './DropdownMenu.module.css';
import { useState } from 'react';

interface DropdownMenuProps {
    children: React.ReactNode;
    title: string | React.ReactNode;
}

export default function DropdownMenu(props: DropdownMenuProps) {
    const [open, setOpen] = useState(false);

    // There is a mouse leave issue. I am currently getting around it by wrapping the children in a div and applying the mouse leave to that div. This still requires the user to enter the children before that function fires.

    // DropdownMenuContainer is also translating on the x axis to fix the alignment that the extra wrapper causes here.
    return (
        <div className={styles.dropdown_control}>
            <div className={styles.menu_icon} onClick={() => setOpen(!open)}>
                {props.title}
            </div>
            <div onMouseLeave={() => setOpen(false)}>{open && props.children}</div>
        </div>
    );
}
