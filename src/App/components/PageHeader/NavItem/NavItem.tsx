import {
    useRef,
    Children,
    ReactNode,
    ReactElement,
    cloneElement,
    Dispatch,
    SetStateAction,
} from 'react';
import styles from './NavItem.module.css';
import UseOnClickOutside from '../../../../utils/hooks/useOnClickOutside';

interface NavItemPropsIF {
    children: ReactNode;
    icon: ReactNode;
    // eslint-disable-next-line
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function NavItem(props: NavItemPropsIF) {
    const { children, icon } = props;
    const navItemRef = useRef<HTMLDivElement>(null);

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
        <div className={styles.nav_item} ref={navItemRef}>
            <div className={styles.icon_button} onClick={() => setOpen(!open)}>
                {icon}
            </div>
            {open && childrenWithProps}
        </div>
    );
}
