import styles from './SidebarFooter.module.css';
import { Link, useLocation } from 'react-router-dom';
import { MdAccountBox, MdOutlineExplore } from 'react-icons/md';
import { RiSwapBoxFill } from 'react-icons/ri';
import { GiTrade } from 'react-icons/gi';
import { BsFillChatDotsFill } from 'react-icons/bs';
import { memo, useContext } from 'react';
import { formSlugForPairParams } from '../../../../App/functions/urlSlugs';
import chainNumToString from '../../../../App/functions/chainNumToString';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';

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

    const { tokenA, tokenB } = useContext(TradeDataContext);

    const paramsSlug = formSlugForPairParams({
        chain: chainNumToString(tokenA.chainId),
        tokenA: tokenA.address,
        tokenB: tokenB.address,
    });

    const linksData = [
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
        <div className={`${styles.sidebar_footer} ${sidebarPositionStyle}`}>
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
        </div>
    );
}

export default memo(SidebarFooter);
