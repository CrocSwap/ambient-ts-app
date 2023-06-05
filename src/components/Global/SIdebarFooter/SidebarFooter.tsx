import styles from './SidebarFooter.module.css';

import { Link, useLocation } from 'react-router-dom';

// import { IoMdAnalytics } from 'react-icons/io';
import { GiTrade } from 'react-icons/gi';
import { BsFillChatDotsFill } from 'react-icons/bs';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { formSlugForPairParams } from '../../../App/functions/urlSlugs';
import { memo, useContext } from 'react';
import { MdAccountBox, MdAutoGraph } from 'react-icons/md';
import { AppStateContext } from '../../../contexts/AppStateContext';
function SidebarFooter() {
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

    const {
        tradeComponent: {
            setShowTradeComponent: setShowTradeComponent,
            showTradeComponent: showTradeComponent,
        },
    } = useContext(AppStateContext);

    const linksData = [
        // ...
        {
            title: 'Trade',
            destination: tradeDestination + paramsSlug,
            icon: GiTrade,
            action: () => setShowTradeComponent(true),
            active: showTradeComponent,
        },
        {
            title: 'Graph',
            destination: tradeDestination + paramsSlug,
            icon: MdAutoGraph,
            action: () => setShowTradeComponent(false),
            active: !showTradeComponent,
        },
        {
            title: 'Account',
            destination: '/account/',
            icon: MdAccountBox,
            active: currentLocation === '/account/',
        },
        {
            title: 'Chat',
            destination: '/chat/',
            icon: BsFillChatDotsFill,
            active: currentLocation === '/chat/',
        },
    ];

    if (currentLocation === '/') return null;

    return (
        <div className={`${styles.top_container} ${sidebarPositionStyle}`}>
            <div className={`${styles.sidebar_footer} `}>
                {linksData.map((link, idx) => (
                    <Link to={link.destination} key={link.destination + idx}>
                        <div
                            onClick={link.action}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <link.icon
                                size={18}
                                color={
                                    link.active
                                        ? 'var(--accent1)'
                                        : 'var(--text-highlight)'
                                }
                            />
                            <p> {link.title}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default memo(SidebarFooter);
