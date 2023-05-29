import {
    RiLayoutBottom2Fill,
    RiLayoutLeftFill,
    RiLayoutRightFill,
} from 'react-icons/ri';
import styles from './PageLayout.module.css';
import DropdownMenu2 from '../../../../components/Global/DropdownMenu2/DropdownMenu2';
import useLayoutHandler from '../../../../utils/hooks/useLayoutHandler';

interface PageLayoutPropsIF {
    toggleSidebarDrawer: (
        open: boolean,
    ) => (event: React.KeyboardEvent | React.MouseEvent) => void;
    toggleTradeDrawer: (
        open: boolean,
    ) => (event: React.KeyboardEvent | React.MouseEvent) => void;
    toggleDefaultLayout: () => void;
    isSidebarDrawerOpen: boolean;
    isTradeDrawerOpen: boolean;
}

export default function PageLayout(props: PageLayoutPropsIF) {
    const {
        toggleSidebarDrawer,
        toggleTradeDrawer,
        toggleDefaultLayout,
        isSidebarDrawerOpen,
        isTradeDrawerOpen,
    } = props;

    const activeIcon = isTradeDrawerOpen ? (
        <RiLayoutRightFill size={25} />
    ) : isSidebarDrawerOpen ? (
        <RiLayoutLeftFill size={25} />
    ) : (
        <RiLayoutBottom2Fill size={25} />
    );

    const layoutData = [
        {
            title: 'Sidebar',
            action: toggleSidebarDrawer(true),
            icon: RiLayoutLeftFill,
        },
        {
            title: 'Normal',
            action: toggleDefaultLayout,
            icon: RiLayoutBottom2Fill,
        },
        {
            title: 'Trade',
            action: toggleTradeDrawer(true),
            icon: RiLayoutRightFill,
        },
    ];

    const layoutContent = (
        <ul
            className={styles.menu_content}
            tabIndex={0}
            // aria-label={dropdownAriaDescription}
        >
            {layoutData.map((layout, idx) => (
                <li
                    key={idx}
                    onClick={layout.action}
                    // key={chain.chainId}
                    className={styles.layout_item}
                    // custom={idx}
                    // variants={ItemEnterAnimation}
                    tabIndex={0}
                >
                    <button className={styles.layout} tabIndex={0}>
                        <layout.icon
                            size={18}
                            // color={
                            //     currentLocation === link.destination
                            //         ? 'var(--accent1)'
                            //         : 'var(--text-highlight)'
                            // }
                        />
                    </button>
                </li>
            ))}
        </ul>
    );
    return (
        <>
            <div className={styles.selector_select_container}>
                <div className={styles.dropdown_menu_container}>
                    <DropdownMenu2
                        titleWidth={'40px'}
                        title={''}
                        activeElement={activeIcon}
                    >
                        {layoutContent}
                    </DropdownMenu2>
                </div>
            </div>
        </>
    );
}
