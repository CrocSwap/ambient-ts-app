import { Dispatch, SetStateAction } from 'react';
import { useChain } from 'react-moralis';
import optimisticImage from '../../../../assets/images/networks/optimistic.svg';
import NetworkButton from './NetworkButton';

interface NetworkButtonsProps {
    chainId: string;
    setFallbackChainId: Dispatch<SetStateAction<string>>;
    onClose: () => void;
    // }
}
export default function NetworkButtons(props: NetworkButtonsProps) {
    const { setFallbackChainId, onClose } = props;
    const {
        chainId: moralisChainId,
        switchNetwork,
    } = useChain();

    const supportedChains = [
        {
            name: 'Görli ',
            id: '0x5',
            icon: optimisticImage,
            theme: '#36364a',
        },
    ];

    const handleNetworkSwitch = (chainId: string) => {
        console.log('switching to ' + chainId);
        setFallbackChainId(chainId);
        if (moralisChainId) {
            switchNetwork(chainId);
        } else if (window.ethereum) {
            window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainId }],
            });
        }
        onClose();
    };

    return (
        <div>
            {supportedChains.map((chain, idx) => (
                <NetworkButton
                    key={idx}
                    name={chain.name}
                    icon={chain.icon}
                    theme={chain.theme}
                    id={chain.id}
                    handleClick={handleNetworkSwitch}
                />
            ))}
        </div>
    );
}
