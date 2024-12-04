import { memo, useContext } from 'react';
import { BsFillChatDotsFill } from 'react-icons/bs';
import { GiTrade } from 'react-icons/gi';
import { MdAccountBox, MdOutlineExplore } from 'react-icons/md';
import { RiHome4Fill, RiSwapBoxFill } from 'react-icons/ri';
import { Link, useLocation } from 'react-router-dom';
import { formSlugForPairParams } from '../../../../App/functions/urlSlugs';
import { chainNumToString } from '../../../../ambient-utils/dataLayer';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import styles from './SidebarFooter.module.css';
// import{ SidebarContext } from '../../../../contexts/SidebarContext';

function SidebarFooter() {
    const location = useLocation();

    const currentLocation = location.pathname;

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

    // const { hideOnMobile } = useContext(SidebarContext);

    const linksData = [
        {
            title: 'Home',
            destination: '/',
            icon: RiHome4Fill,
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
            className={`${styles.sidebar_footer} `}
            // style={{ paddingLeft: !hideOnMobile ? '1.5rem' : '' }}
        >
            {linksData.map((link) =>
                link.destination ? (
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
