import {
    RiLayoutBottom2Fill,
    RiLayoutLeftFill,
    RiLayoutRightFill,
} from 'react-icons/ri';
import styles from './PageLayout.module.css';
import DropdownMenu2 from '../../../../components/Global/DropdownMenu2/DropdownMenu2';
import { BsTable } from 'react-icons/bs';
import { useLocation } from 'react-router-dom';

interface PageLayoutPropsIF {
    toggleSidebarDrawer: (
        open: boolean,
    ) => (event: React.KeyboardEvent | React.MouseEvent) => void;
    toggleTradeDrawer: (
        open: boolean,
    ) => (event: React.KeyboardEvent | React.MouseEvent) => void;

    toggleTableDrawer: (
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
        toggleTableDrawer,
    } = props;

    const location = useLocation();
    const currentLocation = location.pathname;

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
            show: !currentLocation.includes('swap'),
        },
        {
            title: 'Normal',
            action: toggleDefaultLayout,
            icon: RiLayoutBottom2Fill,
            show: false,
        },
        {
            title: 'Table',
            action: toggleTableDrawer(true),
            icon: BsTable,

            show: currentLocation.includes('trade'),
        },
        {
            title: 'Trade',
            action: toggleTradeDrawer(true),
            icon: RiLayoutRightFill,
            show: currentLocation.includes('trade'),
        },
    ];

    const layoutContent = (
        <ul className={styles.menu_content} tabIndex={0}>
            {layoutData.map((layout, idx) => {
                if (layout.show) {
                    return (
                        <li
                            key={idx}
                            onClick={layout.action}
                            className={styles.layout_item}
                            tabIndex={0}
                        >
                            <button className={styles.layout} tabIndex={0}>
                                <layout.icon size={18} />
                            </button>
                        </li>
                    );
                } else {
                    return null;
                }
            })}
        </ul>
    );

    if (currentLocation.includes('swap') || currentLocation === '/')
        return null;
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
