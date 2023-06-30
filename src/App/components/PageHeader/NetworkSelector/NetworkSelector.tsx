import { motion } from 'framer-motion';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import styles from './NetworkSelector.module.css';
import DropdownMenu2 from '../../../../components/Global/DropdownMenu2/DropdownMenu2';
import { ItemEnterAnimation } from '../../../../utils/others/FramerMotionAnimations';
import { getSupportedChainIds } from '../../../../utils/data/chains';
import { useContext } from 'react';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';

interface NetworkSelectorPropsIF {
    switchNetwork: ((chainId_?: number | undefined) => void) | undefined;
}

export default function NetworkSelector(props: NetworkSelectorPropsIF) {
    const { switchNetwork } = props;
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    const chains = getSupportedChainIds().map((chain: string) =>
        lookupChain(chain),
    );

    const dropdownAriaDescription = 'Dropdown menu for networks.';
    const networkMenuContent = (
        <ul
            className={styles.menu_content}
            tabIndex={0}
            aria-label={dropdownAriaDescription}
        >
            {chains.map((chain, idx) => (
                <motion.li
                    onClick={() =>
                        switchNetwork
                            ? switchNetwork(parseInt(chain.chainId))
                            : null
                    }
                    key={chain.chainId}
                    className={styles.network_item}
                    custom={idx}
                    variants={ItemEnterAnimation}
                    tabIndex={0}
                >
                    <div className={styles.chain_name_status} tabIndex={0}>
                        <img
                            src={chain.logoUrl}
                            alt={chain.displayName}
                            width='21px'
                            height='21px'
                            style={{ borderRadius: '50%' }}
                        />
                        {chain.displayName}
                    </div>
                </motion.li>
            ))}
        </ul>
    );

    return (
        <>
            <div className={styles.selector_select_container}>
                <div className={styles.dropdown_menu_container}>
                    <DropdownMenu2
                        marginTop={'50px'}
                        titleWidth={'80px'}
                        title={lookupChain(chainId).displayName}
                        logo={lookupChain(chainId).logoUrl}
                    >
                        {networkMenuContent}
                    </DropdownMenu2>
                </div>
            </div>
        </>
    );
}
