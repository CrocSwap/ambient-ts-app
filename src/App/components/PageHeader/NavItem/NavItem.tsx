import {
    useRef,
    Children,
    ReactNode,
    ReactElement,
    cloneElement,
    Dispatch,
    SetStateAction,
    memo,
} from 'react';
import styles from './NavItem.module.css';
import UseOnClickOutside from '../../../../utils/hooks/useOnClickOutside';

interface NavItemPropsIF {
    children: ReactNode;
    icon: ReactNode;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    square?: boolean;
    allowClicksOutside?: boolean;
}

function NavItem(props: NavItemPropsIF) {
    const {
        children,
        icon,
        open,
        setOpen,
        square,
        allowClicksOutside = false,
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
        <button
            className={styles.nav_item}
            ref={navItemRef}
            tabIndex={0}
            aria-label='Nav item'
        >
            <div
                className={styles.icon_button}
                onClick={() => setOpen(!open)}
                style={{ borderRadius: square ? '4px' : '50%' }}
            >
                {icon}
            </div>
            {open && childrenWithProps}
        </button>
    );
}

export default memo(NavItem);
