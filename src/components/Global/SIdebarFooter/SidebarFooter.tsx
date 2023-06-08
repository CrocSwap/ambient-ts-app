import styles from './SidebarFooter.module.css';

import { Link, useLocation, useNavigate } from 'react-router-dom';

// import { IoMdAnalytics } from 'react-icons/io';

import { GiTrade } from 'react-icons/gi';
import { BsFillChatDotsFill, BsTable } from 'react-icons/bs';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { formSlugForPairParams } from '../../../App/functions/urlSlugs';
import { memo, useContext } from 'react';
import { MdAccountBox } from 'react-icons/md';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { TradeTableContext } from '../../../contexts/TradeTableContext';
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

    const { setExpandTradeTable } = useContext(TradeTableContext);

    const {
        tradeComponent: {
            showOnlyTable,
            showOnlyTrade,
            setShowOnlyTable,
            setShowOnlyTrade,
        },
    } = useContext(AppStateContext);
    const navigate = useNavigate();

    const handleTradeClick = () => {
        navigate(tradeDestination + paramsSlug);
        setShowOnlyTrade(true);
    };
    const handleTableClick = () => {
        navigate(tradeDestination + paramsSlug);
        setShowOnlyTable(true);
        setExpandTradeTable(true);
    };

    const linksData = [
        // ...
        {
            title: 'Trade',
            destination: tradeDestination + paramsSlug,
            icon: GiTrade,
            action: handleTradeClick,
            active: showOnlyTrade,
        },
        {
            title: 'Transactions',
            destination: tradeDestination + paramsSlug,
            icon: BsTable,
            action: handleTableClick,
            active: showOnlyTable,
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
