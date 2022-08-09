// START: Import React and Dongles
import { Dispatch, SetStateAction } from 'react';
import { useChain } from 'react-moralis';
import { FaDotCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

// START: Impot Local Files
import styles from './NetworkSelector.module.css';
import DropdownMenu2 from '../../../../components/Global/DropdownMenu2/DropdownMenu2';
import ethereumImage from '../../../../assets/images/networks/ethereum.png';
import { ItemEnterAnimation } from '../../../../utils/others/FramerMotionAnimations';

interface NetworkSelectorPropsIF {
    chainId: string;
    setFallbackChainId: Dispatch<SetStateAction<string>>;
}

export default function NetworkSelector(props: NetworkSelectorPropsIF) {
    const { chainId, setFallbackChainId } = props;
    const {
        chainId: moralisChainId,
        switchNetwork,
    } = useChain();

    const chains = [
        {
            name: 'Görli ',
            id: '0x5',
            icon: ethereumImage,
            theme: '#36364a',
        },
        {
            name: 'Avalanche ',
            id: '0xa869',
            icon: ethereumImage,
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
    };

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
                        {chain.id == chainId && <FaDotCircle color='#CDC1FF' size={10} />}
                    </div>
                </motion.li>
            ))}
        </ul>
    );

    // TODO  @Junior is the wrapper in the return necessary?
    return (
        <div className={styles.selector_select_container}>
            <div className={styles.dropdown_menu_container}>
                <DropdownMenu2
                    marginTop={'50px'}
                    titleWidth={'130px'}
                    title={currenctChain ? currenctChain[0].name : ''}
                >
                    {networkMenuContent}
                </DropdownMenu2>
            </div>
        </div>
    );
}