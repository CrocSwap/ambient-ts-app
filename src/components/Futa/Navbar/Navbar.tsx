import { FiMoreHorizontal } from 'react-icons/fi';
import NetworkSelector from '../../../App/components/PageHeader/NetworkSelector/NetworkSelector';
import styles from './Navbar.module.css';
import Logo from '../../../assets/futa/images/futaLogo.svg';
import {
    useWeb3ModalAccount,
    useSwitchNetwork,
} from '@web3modal/ethers5/react';
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserDataContext } from '../../../contexts/UserDataContext';
import Button from '../../Form/Button';
import { AppStateContext } from '../../../contexts/AppStateContext';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { motion } from 'framer-motion';
// TODO: UNCOMMENT OUT ANIMATE PRESENCE IF WE WANT THE STAGGER ANIMATION TO ONLY HAPPEN THE FIRST TIME THE USER OPENS THE MENU AND STOP AFTER THAT
const dropdownVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
        height: 'auto',
        opacity: 1,
        transition: {
            duration: 0.3,
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
    exit: {
        height: 0,
        opacity: 0,
        transition: { duration: 0.3 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
};
export default function Navbar() {
    const desktopScreen = useMediaQuery('(min-width: 768px)');

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { isConnected } = useWeb3ModalAccount();
    const { isUserConnected } = useContext(UserDataContext);
    const {
        walletModal: { open: openWalletModal },
    } = useContext(AppStateContext);
    const switchNetwork = isConnected
        ? useSwitchNetwork().switchNetwork
        : undefined;

    const dropdownData = [
        {
            label: 'docs',
            link: '/docs',
        },
        {
            label: 'twitter',
            link: '#',
        },
        {
            label: 'discord',
            link: '#',
        },
        {
            label: 'legal & privacy',
            link: '#',
        },
        {
            label: 'terms of service',
            link: '#',
        },
    ];
    const connectWagmiButton = (
        <Button
            idForDOM='connect_wallet_button_page_header'
            title={desktopScreen ? 'Connect Wallet' : 'Connect'}
            action={openWalletModal}
            thin
            flat
        ></Button>
    );

    return (
        <div className={styles.container}>
            <Link to='/'>
                <img src={Logo} alt='futa logo' />
            </Link>

            <div className={styles.rightContainer}>
                <NetworkSelector
                    switchNetwork={switchNetwork}
                    customBR={'50%'}
                />
                <div className={styles.moreContainer}>
                    <FiMoreHorizontal
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    />
                    {/* <AnimatePresence> */}

                    {isDropdownOpen && (
                        <motion.div
                            className={styles.dropdownMenu}
                            initial='hidden'
                            animate='visible'
                            exit='exit'
                            variants={dropdownVariants}
                        >
                            {dropdownData.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={itemVariants}
                                    className={styles.linkContainer}
                                >
                                    <Link to={item.link}>{item.label}</Link>
                                </motion.div>
                            ))}
                            <motion.p
                                className={styles.version}
                                variants={itemVariants}
                            >
                                Version 1.0.0
                            </motion.p>
                            <motion.button
                                className={styles.logoutButton}
                                variants={itemVariants}
                            >
                                LOG OUT
                            </motion.button>
                        </motion.div>
                    )}
                    {/* </AnimatePresence> */}
                </div>
                {!isUserConnected && connectWagmiButton}
            </div>
        </div>
    );
}
