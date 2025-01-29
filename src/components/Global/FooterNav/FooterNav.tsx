import React, { useCallback, useContext, useEffect, useState } from 'react';
import { CiVault } from 'react-icons/ci';
import { HiArrowsRightLeft } from 'react-icons/hi2';
import { MdOutlineExplore } from 'react-icons/md';
import { RiChat3Line } from 'react-icons/ri';
import { VscAccount } from 'react-icons/vsc';
import { Link, useLocation } from 'react-router-dom';

import { formSlugForPairParams } from '../../../App/functions/urlSlugs';
import {
    chainNumToString,
    checkEoaHexAddress,
    someSupportedNetworkIsVaultSupportedNetwork,
} from '../../../ambient-utils/dataLayer';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import styles from './FooterNav.module.css';

// Memoize the FooterNav component
const FooterNav: React.FC = React.memo(() => {
    const location = useLocation();
    const [activeIndex, setActiveIndex] = useState(0);

    const tradeDestination = location.pathname.includes('trade/market')
        ? '/trade/market/'
        : location.pathname.includes('trade/limit')
          ? '/trade/limit/'
          : location.pathname.includes('trade/pool/')
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
            title: 'Trade',
            destination: `${tradeDestination}${paramsSlug}`,
            icon: HiArrowsRightLeft,
            shouldDisplay: true,
        },
        {
            title: 'Explore',
            destination: '/explore',
            icon: MdOutlineExplore,
            shouldDisplay: true,
        },
        {
            title: 'Vaults',
            destination: '/vaults',
            icon: CiVault,
            shouldDisplay: someSupportedNetworkIsVaultSupportedNetwork,
        },
        {
            title: 'Account',
            destination: '/account/',
            icon: VscAccount,
            shouldDisplay: true,
        },
        {
            title: 'Chat',
            destination: '/chat/',
            icon: RiChat3Line,
            shouldDisplay: true,
        },
    ];

    const path = location.pathname;

    const isAddressEns = path?.includes('.eth');
    const isAddressHex = checkEoaHexAddress(path);

    useEffect(() => {
        const currentPath = location.pathname;

        if (currentPath.includes('/trade')) {
            setActiveIndex(0); // Trade
        } else if (currentPath.includes('/explore')) {
            setActiveIndex(1); // Explore
        } else if (currentPath.includes('/vaults')) {
            setActiveIndex(2); // Vaults
        } else if (
            currentPath.includes('/account') ||
            isAddressEns ||
            isAddressHex
        ) {
            setActiveIndex(3); // Account
        } else if (currentPath.includes('/chat')) {
            setActiveIndex(4); // Chat
        } else {
            setActiveIndex(-1); // Home
        }
    }, [location.pathname]);

    // Memoize the onClick handler to avoid re-creation on each render
    const handleNavClick = useCallback((index: number) => {
        setActiveIndex(index);
    }, []);

    return (
        <div className={styles.nav}>
            {linksData.map(
                (link, index) =>
                    link.shouldDisplay && (
                        <div
                            key={index}
                            className={`${styles.navItem} ${index === activeIndex ? styles.active : ''}`}
                            onClick={() => handleNavClick(index)} // Use memoized handler
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
                                <span className={styles.navText}>
                                    {link.title}
                                </span>
                            </Link>
                        </div>
                    ),
            )}
        </div>
    );
});

// Add a displayName for debugging and tools like React DevTools
FooterNav.displayName = 'FooterNav';

export default FooterNav;
