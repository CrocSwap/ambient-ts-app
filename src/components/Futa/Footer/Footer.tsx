import { MdOutlineExplore, MdOutlineSwapVerticalCircle } from 'react-icons/md';
import styles from './Footer.module.css';
import { RiAccountCircleLine } from 'react-icons/ri';
import { FiPlusCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import DesktopFooter from './DesktopFooter';
import { useContext } from 'react';
import { formSlugForPairParams } from '../../../App/functions/urlSlugs';
import { chainNumToString } from '../../../ambient-utils/dataLayer';
import { TradeDataContext } from '../../../contexts/TradeDataContext';

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

    

    const paramsSlug = formSlugForPairParams({
        chain: chainNumToString(tokenA.chainId),
        tokenA: tokenA.address,
        tokenB: tokenB.address,
    });
    const footerItems = [
        {
            label: 'Explore',
            link: '/auctions',
            icon: <MdOutlineExplore size={24} color='var(--text1)' />,
        },
        {
            label: 'Create',
            link: '/create',
            icon: <FiPlusCircle size={24} color='var(--text1)' />,
        },
        {
            label: 'Swap',
            link: '/swap/' + paramsSlug,
            icon: <MdOutlineSwapVerticalCircle size={24} color='var(--text1)' />,
        },
  
        {
            label: 'Account',
            link: '/account',
            icon: <RiAccountCircleLine size={24} color='var(--text1)' />,
        },
    ];

    const desktopScreen = useMediaQuery('(min-width: 780px)');

    if (desktopScreen) return <DesktopFooter />;

    return (
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
                    <Link to={item.link} className={styles.footerItem}>
                        {item.icon}
                        {item.label}
                    </Link>
                </motion.div>
            ))}
        </motion.footer>
    );
}
