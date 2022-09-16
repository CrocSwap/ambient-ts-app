// START: Import React and Dongles
import { Dispatch, SetStateAction, useState } from 'react';
import { FaDotCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';

// START: Import Local Files
import styles from './NetworkSelector.module.css';
import DropdownMenu2 from '../../../../components/Global/DropdownMenu2/DropdownMenu2';
import { ItemEnterAnimation } from '../../../../utils/others/FramerMotionAnimations';
import { ambientChains } from '../../../../utils/data/chains';
import IconWithTooltip from '../../../../components/Global/IconWithTooltip/IconWithTooltip';

interface NetworkSelectorPropsIF {
    chainId: string;
    switchChain: Dispatch<SetStateAction<string>>;
}

export default function NetworkSelector(props: NetworkSelectorPropsIF) {
    const { chainId, switchChain } = props;

    const chains = ambientChains.map((chain: string) => lookupChain(chain));

    const networkMenuContent = (
        <ul className={styles.menu_content}>
            {chains.map((chain, idx) => (
                <motion.li
                    onClick={() => switchChain(chain.chainId)}
                    key={chain.chainId}
                    className={styles.network_item}
                    custom={idx}
                    variants={ItemEnterAnimation}
                >
                    <div className={styles.chain_name_status}>
                        {lookupChain(chainId).displayName}
                        {chain.chainId == chainId && <FaDotCircle color='#CDC1FF' size={10} />}
                    </div>
                </motion.li>
            ))}
        </ul>
    );

    // TODO:  @Junior is the wrapper in the return necessary?
    const [showDropdown, setShowDropdown] = useState(false);

    const networks = ['network1', 'network2', 'network3', 'network4', 'network5'];
    const dropdownMenu = (
        <motion.div
            className={styles.dropdown_menu}
            animate={showDropdown ? 'visible' : 'hidden'}
            initial='hidden'
            variants={container}
        >
            {networks.map((network, idx) => (
                <motion.div variants={item} key={idx}>
                    <p>{network}</p>
                </motion.div>
            ))}
        </motion.div>
    );

    const newDropdown = (
        <motion.div className={styles.main_container}>
            <div className={styles.clicker} onClick={() => setShowDropdown(!showDropdown)}>
                I am clicker
                {showDropdown ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
            </div>
            {showDropdown && dropdownMenu}
        </motion.div>
    );
    return (
        <div className={styles.selector_select_container}>
            <IconWithTooltip title='Network' placement='left'>
                <div className={styles.dropdown_menu_container}>
                    <DropdownMenu2
                        marginTop={'50px'}
                        titleWidth={'80px'}
                        title={lookupChain(chainId).displayName}
                    >
                        {networkMenuContent}
                    </DropdownMenu2>
                </div>
            </IconWithTooltip>
        </div>
    );
}

const item = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
};

const container = {
    hidden: { opacity: 0, scale: 0.1 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            //   responsible for showing children 1 by 1
            when: 'beforeChildren',
            staggerChildren: 0.2,
            opacity: { duration: 0.2 },
            scale: {
                type: 'spring',
                stiffness: 500,
                damping: 40,
                restSpeed: 0.6,
            },
        },
    },
};
