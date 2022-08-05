// import styles from './Row.module.css';
import { useChain } from 'react-moralis';
import kovanImage from '../../../../assets/images/networks/kovan.svg';
import NetworkButton from './NetworkButton';
interface NetworkButtonsProps {
    //     children: React.ReactNode;
    chainId: string;
    setFallbackChainId: React.Dispatch<React.SetStateAction<string>>;
    onClose: () => void;
    // }
}
export default function NetworkButtons(props: NetworkButtonsProps) {
    const { setFallbackChainId, onClose } = props;
    const {
        // chainId,
        chainId: moralisChainId,
        switchNetwork,
    } = useChain();

    const supportedChains = [
        {
            name: 'Görli ',
            id: '0x5',
            icon: kovanImage,
            theme: '#36364a',
        },
    ];

    // const currenctChain = supportedChains.filter((chain) => chain.id === chainId);
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
