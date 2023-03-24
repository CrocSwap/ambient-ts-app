import {
    useRef,
    Children,
    ReactNode,
    ReactElement,
    cloneElement,
    Dispatch,
    SetStateAction,
    useEffect,
} from 'react';
import styles from './NavItem.module.css';
import UseOnClickOutside from '../../../../utils/hooks/useOnClickOutside';

interface NavItemPropsIF {
    children: ReactNode;
    icon: ReactNode;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function NavItem(props: NavItemPropsIF) {
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

    // const enterFunction = (event: KeyboardEvent) => {
    //     if (event.key === 'Enter') {
    //         console.log('opened')
    //     }

    // }

    // useEffect(() => {
    //     document.addEventListener('keydown', enterFunction, false);
    //     return () => {
    //         document.removeEventListener('keydown', enterFunction, false);
    //     };
    // }, []);

    return (
        <button
            className={styles.nav_item}
            ref={navItemRef}
            tabIndex={0}
            onKeyDown={() => setOpen(true)}
        >
            <div className={styles.icon_button} onClick={() => setOpen(!open)}>
                {icon}
            </div>
            {open && childrenWithProps}
        </button>
    );
}
