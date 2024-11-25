import {
    Children,
    Dispatch,
    ReactElement,
    ReactNode,
    SetStateAction,
    cloneElement,
    memo,
    useContext,
    useRef,
} from 'react';
import UseOnClickOutside from '../../../../utils/hooks/useOnClickOutside';

import { AppStateContext } from '../../../../contexts/AppStateContext';
import styles from './NavItem.module.css';
interface NavItemPropsIF {
    children: ReactNode;
    icon: ReactNode;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    allowClicksOutside?: boolean;
    square?: boolean;
    blurBg?: boolean;
}

function NavItem(props: NavItemPropsIF) {
    const { appHeaderDropdown } = useContext(AppStateContext);
    const {
        children,
        icon,
        open,
        setOpen,
        allowClicksOutside = false,
        blurBg = true,
    } = props;
    const navItemRef = useRef<HTMLButtonElement>(null);

    const clickOutsideHandler = () => {
        if (!allowClicksOutside) setOpen(false);
        appHeaderDropdown.setIsActive(false);
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
            className={styles.navItemButton}
            ref={navItemRef}
            tabIndex={0}
            aria-label='Nav item'
        >
            <div
                className={styles.navItemIconButton}
                onClick={() => {
                    setOpen((prevOpen) => {
                        const newOpen = !prevOpen;
                        if (blurBg) {
                            appHeaderDropdown.setIsActive(newOpen);
                        }
                        return newOpen;
                    });
                }}
            >
                {icon}
            </div>

            {open && childrenWithProps}
        </button>
    );
}

export default memo(NavItem);
