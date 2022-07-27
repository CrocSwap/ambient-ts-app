import styles from './NetworkSelector.module.css';
// import { useState } from 'react';
import { useChain, useMoralis } from 'react-moralis';
import { BiDownArrow } from 'react-icons/bi';
import DropdownMenu2 from '../../../../components/Global/DropdownMenu2/DropdownMenu2';

interface NetworkSelectorProps {
    chainId: string;
    setFallbackChainId: React.Dispatch<React.SetStateAction<string>>;
}

export default function NetworkSelector(props: NetworkSelectorProps) {
    const { chainId, setFallbackChainId } = props;
    const { isWeb3Enabled } = useMoralis();
    const {
        // chainId,
        chainId: moralisChainId,
        switchNetwork,
    } = useChain();
    // const [selectedChain, setSelectedChain] = useState(chainId?.toString());

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
                // setSelectedChain(e.target.value);
                if (isWeb3Enabled) {
                    switchNetwork(e.target.value);
                }
            }}
            className={styles.selector_select}
            value={chainId}
        >
            {selectOptions}
        </select>
    );

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

    const networkMenu = (
        <DropdownMenu2 title='Network'>
            {chains.map((chain) => (
                <p key={chain.id}>chain.name</p>
            ))}
        </DropdownMenu2>
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
