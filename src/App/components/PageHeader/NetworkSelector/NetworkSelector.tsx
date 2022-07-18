import styles from './NetworkSelector.module.css';
import { useState } from 'react';
import { useChain, useMoralis } from 'react-moralis';
import { BiDownArrow } from 'react-icons/bi';

// interface NetworkSelectorProps {
//     children: React.ReactNode;
// }

export default function NetworkSelector() {
    const { isWeb3Enabled } = useMoralis();
    const { chainId, switchNetwork } = useChain();
    const [selectedChain, setSelectedChain] = useState(chainId?.toString());

    // this chains data will eventually be stored in the data folder.
    const chains = [
        {
            name: 'Kovan Testnet',
            id: '0x2a',
            icon: null,
            theme: '#36364a',
        },
        {
            name: 'Goerli Testnet',
            id: '0x5',
            icon: null,
            theme: '#36364a',
        },
        {
            name: 'Avalanche Testnet',
            id: '0xa869',
            icon: '',
            theme: 'red',
        },
        {
            name: 'Ethereum Mainnet',
            id: '0x1',
            icon: null,
            theme: 'blue',
        },
    ];

    const selectOptions = chains.map((chain) => (
        <option className={styles.selector_option} key={chain.id} value={chain.id}>
            {chain.name}
        </option>
    ));

    const selectElement = (
        <select
            onChange={(e) => {
                setSelectedChain(e.target.value);
                if (isWeb3Enabled) {
                    switchNetwork(e.target.value);
                }
            }}
            className={styles.selector_select}
            value={selectedChain}
        >
            {selectOptions}
        </select>
    );

    return (
        <div className={styles.selector_select_container}>
            {selectElement}
            <span className={styles.custom_arrow}>
                <BiDownArrow size={20} color='#ffffff' />
            </span>
        </div>
    );
}
