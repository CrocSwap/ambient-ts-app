import styles from './SidebarFooter.module.css';

import { Link, useLocation } from 'react-router-dom';

// import { IoMdAnalytics } from 'react-icons/io';
import {
    RiSwapBoxFill,
    RiLayoutLeftFill,
    RiLayoutRightFill,
} from 'react-icons/ri';
import { GiTrade } from 'react-icons/gi';
import { BsFillChatDotsFill } from 'react-icons/bs';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { formSlugForPairParams } from '../../../App/functions/urlSlugs';
import { memo } from 'react';

interface PropsIF {
    toggleTradeDrawer: (
        open: boolean,
    ) => (event: React.KeyboardEvent | React.MouseEvent) => void;
    toggleSidebarDrawer: (
        open: boolean,
    ) => (event: React.KeyboardEvent | React.MouseEvent) => void;
}
function SidebarFooter(props: PropsIF) {
    const { toggleSidebarDrawer, toggleTradeDrawer } = props;
    const location = useLocation();

    const currentLocation = location.pathname;

    const sidebarPositionStyle =
        currentLocation === '/'
            ? styles.position_sticky
            : styles.position_absolute;

    const tradeDestination = location.pathname.includes('trade/market')
        ? '/trade/market/'
        : location.pathname.includes('trade/limit')
        ? '/trade/limit/'
        : location.pathname.includes('trade/range')
        ? '/trade/range/'
        : location.pathname.includes('trade/edit')
        ? '/trade/edit/'
        : '/trade/market/';

    const tradeData = useAppSelector((state) => state.tradeData);

    const paramsSlug = formSlugForPairParams(
        tradeData.tokenA.chainId,
        tradeData.tokenA,
        tradeData.tokenB,
    );

    const linksData = [
        // { title: 'Home', destination: '/', icon: FaHome },
        {
            title: 'Swap',
            destination: '/swap/' + paramsSlug,
            icon: RiSwapBoxFill,
        },
        {
            title: 'Trade',
            destination: tradeDestination + paramsSlug,
            icon: GiTrade,
        },
        // { title: 'Account', destination: '/account/', icon: MdAccountBox },
        { title: 'Chat', destination: '/chat/', icon: BsFillChatDotsFill },
    ];

    return (
        <div className={`${styles.sidebar_footer} ${sidebarPositionStyle}`}>
            {location.pathname.includes('trade') && (
                <div className={styles.column}>
                    <button onClick={toggleSidebarDrawer(true)}>
                        <RiLayoutLeftFill size={20} />
                    </button>
                    <p>Sidebar</p>
                </div>
            )}
            {linksData.map((link) => (
                <Link to={link.destination} key={link.destination}>
                    <link.icon
                        size={18}
                        color={
                            currentLocation === link.destination
                                ? 'var(--accent1)'
                                : 'var(--text-highlight)'
                        }
                    />
                    <p> {link.title}</p>
                </Link>
            ))}
            {location.pathname.includes('trade') && (
                <div className={styles.column}>
                    <button onClick={toggleTradeDrawer(true)}>
                        <RiLayoutRightFill size={18} />
                    </button>
                    <p>Trade</p>
                </div>
            )}
        </div>
    );
}

export default memo(SidebarFooter);
