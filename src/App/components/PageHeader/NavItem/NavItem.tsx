import styles from './NavItem.module.css';
import React, { useState, useRef } from 'react';
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

    const childrenWithProps = React.Children.map(props.children, (child, index) => {
        // eslint-disable-next-line
        return React.cloneElement(child as React.ReactElement<any>, {
            closeMenu: () => {
                setOpen(false);
            },
            index,
        });
    });

    return (
        <div className={styles.nav_item} ref={navItemRef}>
            <div className={styles.icon_button} onClick={() => setOpen(!open)}>
                {props.icon}
            </div>

            {/* {open && props.children} */}
            {open && childrenWithProps}
            {/* <div>{React.cloneElement(props.children as React.ReactElement<any>, {attributeToAddOrReplace})}</div> */}
        </div>
    );
}
