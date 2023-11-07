import React, {
    useRef,
    Children,
    ReactNode,
    ReactElement,
    cloneElement,
    Dispatch,
    SetStateAction,
    memo,
} from 'react';
import UseOnClickOutside from '../../../../utils/hooks/useOnClickOutside';
import {
    NavItemButton,
    NavItemIconButton,
} from '../../../../styled/Components/Header';

interface NavItemPropsIF {
    children: ReactNode;
    icon: ReactNode;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    allowClicksOutside?: boolean;
    square?: boolean;
}

function NavItem(props: NavItemPropsIF) {
    const {
        children,
        icon,
        open,
        setOpen,
        allowClicksOutside = false,
        square,
    } = props;
    const navItemRef = useRef<HTMLButtonElement>(null);

    const clickOutsideHandler = () => {
        if (!allowClicksOutside) setOpen(false);
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
        <NavItemButton
            className='nav_item'
            ref={navItemRef}
            tabIndex={0}
            aria-label='Nav item'
        >
            <NavItemIconButton square={square} onClick={() => setOpen(!open)}>
                {icon}
            </NavItemIconButton>
            {open && childrenWithProps}
        </NavItemButton>
    );
}

export default memo(NavItem);
