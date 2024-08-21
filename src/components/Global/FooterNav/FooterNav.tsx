import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RiHome4Fill, RiSwapBoxFill } from 'react-icons/ri';
import { GiTrade } from 'react-icons/gi';
import { MdAccountBox, MdOutlineExplore } from 'react-icons/md';
import { BsFillChatDotsFill } from 'react-icons/bs';
import { motion } from 'framer-motion';
import styles from './FooterNav.module.css';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import { formSlugForPairParams } from '../../../App/functions/urlSlugs';
import {
    chainNumToString,
    checkEoaHexAddress,
} from '../../../ambient-utils/dataLayer';
// import { SidebarContext } from '../../contexts/SidebarContext';

const FooterNav: React.FC = () => {
    const location = useLocation();
    const [activeIndex, setActiveIndex] = useState(0);

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
        { title: 'Home', destination: '/', icon: RiHome4Fill },
        {
            title: 'Swap',
            destination: `/swap/${paramsSlug}`,
            icon: RiSwapBoxFill,
        },
        {
            title: 'Trade',
            destination: `${tradeDestination}${paramsSlug}`,
            icon: GiTrade,
        },
        { title: 'Explore', destination: '/explore', icon: MdOutlineExplore },
        { title: 'Account', destination: '/account/', icon: MdAccountBox },
        { title: 'Chat', destination: '/chat/', icon: BsFillChatDotsFill },
    ];

    const path = location.pathname;

    const isAddressEns = path?.includes('.eth');
    const isAddressHex = checkEoaHexAddress(path);

    useEffect(() => {
        const currentPath = location.pathname;

        if (currentPath.includes('/swap')) {
            setActiveIndex(1); // Swap
        } else if (currentPath.includes('/trade')) {
            setActiveIndex(2); // Trade
        } else if (currentPath.includes('/explore')) {
            setActiveIndex(3); // Explore
        } else if (
            currentPath.includes('/account') ||
            isAddressEns ||
            isAddressHex
        ) {
            setActiveIndex(4); // Account
        } else if (currentPath.includes('/chat')) {
            setActiveIndex(5); // Chat
        } else {
            setActiveIndex(0); // Home
        }
    }, [location.pathname]);

    return (
        <div className={styles.nav}>
            {linksData.map((link, index) => (
                <motion.div
                    key={link.destination}
                    className={`${styles.navItem} ${index === activeIndex ? styles.active : ''}`}
                    onClick={() => setActiveIndex(index)}
                    initial={{ flexGrow: 1 }}
                    animate={{ flexGrow: index === activeIndex ? 3 : 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    <Link to={link.destination} className={styles.link}>
                        <link.icon
                            size={24}
                            color={
                                index === activeIndex ? 'var(--accent1)' : ''
                            }
                            className={styles.icon}
                        />
                        <motion.span
                            className={styles.navText}
                            initial={{ opacity: 0, width: 0 }}
                            animate={{
                                opacity: index === activeIndex ? 1 : 0,
                                width: index === activeIndex ? 'auto' : 0,
                                display:
                                    index === activeIndex ? 'inline' : 'none',
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            {link.title}
                        </motion.span>
                    </Link>
                </motion.div>
            ))}
        </div>
    );
};

export default FooterNav;
