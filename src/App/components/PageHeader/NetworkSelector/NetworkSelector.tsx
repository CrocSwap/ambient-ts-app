import styles from './NetworkSelector.module.css';
// import { useState } from 'react';
import { useChain } from 'react-moralis';
import { FaDotCircle } from 'react-icons/fa';
import DropdownMenu2 from '../../../../components/Global/DropdownMenu2/DropdownMenu2';
import { motion } from 'framer-motion';
import kovanImage from '../../../../assets/images/networks/kovan.svg';
import ethereumImage from '../../../../assets/images/networks/ethereum.png';
import { ItemEnterAnimation } from '../../../../utils/others/FramerMotionAnimations';

interface NetworkSelectorProps {
    chainId: string;
    setFallbackChainId: React.Dispatch<React.SetStateAction<string>>;
}

export default function NetworkSelector(props: NetworkSelectorProps) {
    const { chainId, setFallbackChainId } = props;
    const {
        // chainId,
        chainId: moralisChainId,
        switchNetwork,
    } = useChain();
    // const [selectedChain, setSelectedChain] = useState(chainId?.toString());

    // this chains data will eventually be stored in the data folder.

    // console.log(chainId);
    const chains = [
        {
            name: 'Kovan ',
            id: '0x2a',
            icon: kovanImage,
            theme: '#36364a',
        },
        {
            name: 'Görli ',
            id: '0x5',
            icon: kovanImage,
            theme: '#36364a',
        },
        {
            name: 'Avalanche ',
            id: '0xa869',
            icon: kovanImage,
            theme: 'red',
        },
        {
            name: 'Ethereum ',
            id: '0x1',
            icon: ethereumImage,
            theme: 'blue',
        },
    ];

    const currenctChain = chains.filter((chain) => chain.id === chainId);

    const handleNetworkSwitch = (chainId: string) => {
        console.log('switching to ' + chainId);
        setFallbackChainId(chainId);
        if (moralisChainId) {
            switchNetwork(chainId);
        }
        // else if (window.ethereum) {
        //     window.ethereum.request({
        //         method: 'wallet_switchEthereumChain',
        //         params: [{ chainId: chainId }],
        //     });
        // }
        // closeMenu ? closeMenu() : null;
    };

    const circleIcon = <FaDotCircle color='#CDC1FF' size={10} />;

    const networkMenuContent = (
        <ul className={styles.menu_content}>
            {chains.map((chain, idx) => (
                <motion.li
                    onClick={() => handleNetworkSwitch(chain.id)}
                    key={chain.id}
                    className={styles.network_item}
                    custom={idx}
                    variants={ItemEnterAnimation}
                >
                    <img src={chain.icon} className={styles.icon_button} alt={chain.name} />
                    <div className={styles.chain_name_status}>
                        {chain.name}
                        {chain.id == chainId && circleIcon}
                    </div>
                </motion.li>
            ))}
        </ul>
    );

    const networkMenu = (
        <div className={styles.dropdown_menu_container}>
            <DropdownMenu2
                marginTop={'50px'}
                titleWidth={'130px'}
                title={currenctChain ? currenctChain[0].name : ''}
            >
                {networkMenuContent}
            </DropdownMenu2>
        </div>
    );

    return (
        <div className={styles.selector_select_container}>
            {/* {selectElement}
            <span className={styles.custom_arrow}>
                <BiDownArrow size={20} color='#ffffff' />
            </span> */}
            {networkMenu}
        </div>
    );
}
