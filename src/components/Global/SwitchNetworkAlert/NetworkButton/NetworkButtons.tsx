import { Dispatch, SetStateAction } from 'react';
import optimisticImage from '../../../../assets/images/networks/optimistic.svg';
import NetworkButton from './NetworkButton';

interface NetworkButtonsPropsIF {
    chainId: string;
    switchChain: Dispatch<SetStateAction<string>>;
    onClose: () => void;
}
export default function NetworkButtons(props: NetworkButtonsPropsIF) {
    const { chainId, switchChain, onClose } = props;

    const supportedChains = [
        {
            name: 'Görli ',
            id: '0x5',
            icon: optimisticImage,
            theme: '#36364a',
        },
    ];

    const handleNetworkSwitch = (chain: string) => {
        if (chainId) {
            switchChain(chain);
        } else if (window.ethereum) {
            window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chain }],
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
