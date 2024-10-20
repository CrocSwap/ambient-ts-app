import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RiChat3Line } from 'react-icons/ri';
import { MdOutlineExplore } from 'react-icons/md';
import { HiArrowsRightLeft } from 'react-icons/hi2';
import { VscAccount } from 'react-icons/vsc';

import styles from './FooterNav.module.css';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import { formSlugForPairParams } from '../../../App/functions/urlSlugs';
import {
    chainNumToString,
    checkEoaHexAddress,
} from '../../../ambient-utils/dataLayer';

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

    const linksData = [
        // { title: 'Home', destination: '/', icon: RiHome2Line },
        // {
        //     title: 'Swap',
        //     destination: `/swap/${paramsSlug}`,
        //     icon: RiSwapBoxFill,
        // },
        {
            title: 'Trade',
            destination: `${tradeDestination}${paramsSlug}`,
            icon: HiArrowsRightLeft,
        },
        { title: 'Explore', destination: '/explore', icon: MdOutlineExplore },
        { title: 'Account', destination: '/account/', icon: VscAccount },
        { title: 'Chat', destination: '/chat/', icon: RiChat3Line },
    ];

    const path = location.pathname;

    const isAddressEns = path?.includes('.eth');
    const isAddressHex = checkEoaHexAddress(path);

    useEffect(() => {
        const currentPath = location.pathname;

        // if (currentPath.includes('/swap')) {
        //     setActiveIndex(1); // Swap
        // } else
        if (currentPath.includes('/trade')) {
            setActiveIndex(0); // Trade
        } else if (currentPath.includes('/explore')) {
            setActiveIndex(1); // Explore
        } else if (
            currentPath.includes('/account') ||
            isAddressEns ||
            isAddressHex
        ) {
            setActiveIndex(2); // Account
        } else if (currentPath.includes('/chat')) {
            setActiveIndex(3); // Chat
        } else {
            setActiveIndex(-1); // Home
        }
    }, [location.pathname]);

    return (
        <div className={styles.nav}>
            {linksData.map((link, index) => (
                <div
                    key={index}
                    className={`${styles.navItem} ${index === activeIndex ? styles.active : ''}`}
                    onClick={() => setActiveIndex(index)}
                >
                    <Link to={link.destination} className={styles.link}>
                        <link.icon
                            size={24}
                            color={
                                index === activeIndex
                                    ? 'var(--accent1)'
                                    : 'var(--text1)'
                            }
                            className={styles.icon}
                        />
                        <span className={styles.navText}>{link.title}</span>
                    </Link>
                </div>
            ))}
        </div>
    );
};

export default FooterNav;
