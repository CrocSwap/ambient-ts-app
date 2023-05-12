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
}

function NavItem(props: NavItemPropsIF) {
    const { children, icon } = props;
    const navItemRef = useRef<HTMLButtonElement>(null);

    const { open, setOpen } = props;

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
        <button
            className={styles.nav_item}
            ref={navItemRef}
            tabIndex={0}
            aria-label='Nav item'
            onKeyDown={() => setOpen(true)}
        >
            <div className={styles.icon_button} onClick={() => setOpen(!open)}>
                {icon}
            </div>
            {open && childrenWithProps}
        </button>
    );
}

export default memo(NavItem);
