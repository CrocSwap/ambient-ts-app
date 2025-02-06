import { motion } from 'framer-motion';
import { useContext } from 'react';
import { FiPlusCircle } from 'react-icons/fi';
import { MdOutlineExplore } from 'react-icons/md';
import { RiAccountCircleLine } from 'react-icons/ri';
import { Link, useLocation } from 'react-router-dom';
import { formSlugForPairParams } from '../../../App/functions/urlSlugs';
import { chainNumToString } from '../../../ambient-utils/dataLayer';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import DesktopFooter from './DesktopFooter';
import styles from './Footer.module.css';
import { GoArrowSwitch } from 'react-icons/go';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1, // Stagger the appearance of child elements
            delayChildren: 0.2, // Delay before children start appearing
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
};

export default function Footer() {
    const { tokenA, tokenB } = useContext(TradeDataContext);
    const location = useLocation();

    const paramsSlug = formSlugForPairParams({
        chain: chainNumToString(tokenA.chainId),
        tokenA: tokenA.address,
        tokenB: tokenB.address,
    });
    const activeColor = '#AACFD1';
    const inactiveColor = '#5C6F72';
    const footerItems = [
        {
            label: 'Auctions',
            link: '/auctions',
            icon: (
                <MdOutlineExplore
                    size={24}
                    color={
                        location.pathname.includes('auctions')
                            ? activeColor
                            : inactiveColor
                    }
                />
            ),
        },
        {
            label: 'Swap',
            link: '/swap/' + paramsSlug,
            icon: (
                <GoArrowSwitch
                    size={24}
                    color={
                        location.pathname.includes('swap')
                            ? activeColor
                            : inactiveColor
                    }
                />
            ),
        },

        {
            label: 'Account',
            link: '/account',
            icon: (
                <RiAccountCircleLine
                    size={24}
                    color={
                        location.pathname.includes('account')
                            ? activeColor
                            : inactiveColor
                    }
                />
            ),
        },
        {
            label: 'Create',
            link: '/create',
            icon: (
                <FiPlusCircle
                    size={24}
                    color={
                        location.pathname.includes('create')
                            ? activeColor
                            : inactiveColor
                    }
                />
            ),
        },
    ];

    const desktopScreen = useMediaQuery('(min-width: 780px)');

    if (desktopScreen) return <DesktopFooter />;

    return location.pathname == '/' ? null : (
        <motion.footer
            className={styles.container}
            initial='hidden'
            animate='visible'
            variants={containerVariants}
        >
            {footerItems.map((item, idx) => (
                <motion.div
                    key={idx}
                    className={styles.footerContainer}
                    variants={itemVariants}
                >
                    <Link
                        to={item.link}
                        className={styles.footerItem}
                        style={{
                            color: location.pathname.includes(
                                item.label === 'Explore'
                                    ? 'auctions'
                                    : item.label.toLowerCase(),
                            )
                                ? activeColor
                                : inactiveColor,
                        }}
                    >
                        {item.icon}
                        {item.label}
                    </Link>
                </motion.div>
            ))}
        </motion.footer>
    );
}
