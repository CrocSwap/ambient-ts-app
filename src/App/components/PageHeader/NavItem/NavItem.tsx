import { useState, useRef, Children, ReactNode, ReactElement, cloneElement } from 'react';
import styles from './NavItem.module.css';
import UseOnClickOutside from '../../../../utils/hooks/useOnClickOutside';

interface NavItemPropsIF {
    children: ReactNode;
    icon: ReactNode;
}

export default function NavItem(props: NavItemPropsIF) {
    const { children, icon } = props;
    const navItemRef = useRef<HTMLDivElement>(null);

    const [open, setOpen] = useState(false);

    const clickOutsideHandler = () => {
        setOpen(false);
    };

    UseOnClickOutside(navItemRef, clickOutsideHandler);

    const childrenWithProps = Children.map(children, (child, index) => {
        // eslint-disable-next-line
        return cloneElement(child as ReactElement<any>, {
            closeMenu: () => setOpen(false),
            index,
        });
    });

    return (
        <div className={styles.nav_item} ref={navItemRef}>
            <div className={styles.icon_button} onClick={() => setOpen(!open)}>
                {icon}
            </div>
            {open && childrenWithProps}
        </div>
    );
}
