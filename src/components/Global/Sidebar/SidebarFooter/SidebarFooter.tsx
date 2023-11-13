import styles from './SidebarFooter.module.css';
import { Link, useLocation } from 'react-router-dom';
import { MdAccountBox, MdOutlineExplore } from 'react-icons/md';
import { RiSwapBoxFill } from 'react-icons/ri';
import { GiTrade } from 'react-icons/gi';
import { BsFillChatDotsFill } from 'react-icons/bs';
import { memo, useContext } from 'react';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { formSlugForPairParams } from '../../../../App/functions/urlSlugs';
import chainNumToString from '../../../../App/functions/chainNumToString';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import { VscLayoutSidebarLeft } from 'react-icons/vsc';

function SidebarFooter() {
    const location = useLocation();

    const currentLocation = location.pathname;

    const sidebarPositionStyle =
        currentLocation === '/'
            ? styles.position_sticky
            : styles.position_sticky;

    const tradeDestination = location.pathname.includes('trade/market')
        ? '/trade/market/'
        : location.pathname.includes('trade/limit')
        ? '/trade/limit/'
        : location.pathname.includes('trade/pool')
        ? '/trade/pool/'
        : location.pathname.includes('trade/edit')
        ? '/trade/edit/'
        : '/trade/market/';

    const tradeData = useAppSelector((state) => state.tradeData);

    const paramsSlug = formSlugForPairParams({
        chain: chainNumToString(tradeData.tokenA.chainId),
        tokenA: tradeData.tokenA.address,
        tokenB: tradeData.tokenB.address,
    });

    const { hideOnMobile, toggleMobileModeVisibility, sidebar } =
        useContext(SidebarContext);

    const handleSidebarCloseAndOpen = () => {
        toggleMobileModeVisibility();

        if (!sidebar.isOpen) {
            sidebar.open(true);
        }
    };

    const linksData = [
        {
            title: 'Sidebar ',
            onClick: handleSidebarCloseAndOpen,
            icon: VscLayoutSidebarLeft,
            isButton: true,
        },
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
        {
            title: 'Explore',
            destination: '/explore',
            icon: MdOutlineExplore,
        },
        { title: 'Account', destination: '/account/', icon: MdAccountBox },
        { title: 'Chat', destination: '/chat/', icon: BsFillChatDotsFill },
    ];
    return (
        <div
            className={`${styles.sidebar_footer} ${sidebarPositionStyle}`}
            style={{ paddingLeft: !hideOnMobile ? '1.5rem' : '' }}
        >
            {linksData.map((link) =>
                link.isButton ? (
                    <span onClick={link.onClick} key={link.title}>
                        <link.icon size={18} color='var(--text-highlight)' />
                        <p>{link.title}</p>
                    </span>
                ) : link.destination ? (
                    <Link to={link.destination} key={link.destination}>
                        <link.icon
                            size={18}
                            color={
                                currentLocation === link.destination
                                    ? 'var(--accent1)'
                                    : 'var(--text-highlight)'
                            }
                        />
                        <p>{link.title}</p>
                    </Link>
                ) : (
                    ''
                ),
            )}
        </div>
    );
}

export default memo(SidebarFooter);
