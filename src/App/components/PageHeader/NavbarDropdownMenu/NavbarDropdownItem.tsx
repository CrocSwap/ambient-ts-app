import { ReactNode } from 'react';

import styles from './NavbarDropdownMenu.module.css';
interface propsIF {
    onClick: () => void;
    children: ReactNode;
    rightIcon?: ReactNode;
    connectButton?: boolean;
}

export default function NavbarDropdownItem(props: propsIF) {
    const innerHtml = (
        <>
            <span>{props.children}</span>
            <span className={styles.iconRight}>{props.rightIcon}</span>
        </>
    );
    if (props.connectButton) {
        return (
            <button
                className={styles.connectButton}
                onClick={() => props.onClick()}
                tabIndex={0}
                role='button'
            >
                {innerHtml}
            </button>
        );
    }

    return (
        <div
            className={styles.menuItem}
            onClick={() => props.onClick()}
            tabIndex={0}
            role='button'
        >
            {innerHtml}
        </div>
    );
}
