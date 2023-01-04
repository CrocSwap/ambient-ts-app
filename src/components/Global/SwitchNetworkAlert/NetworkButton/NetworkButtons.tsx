// import goerliLogo from '../../../../assets/images/networks/goerli.png';
// https://github.com/goerli/goer-logo

// import ethereumLogo from '../../../../assets/images/networks/ethereum.png';

import { useSwitchNetwork } from 'wagmi';
import NetworkButton from './NetworkButton';

// interface NetworkButtonsPropsIF {
//     switchNetwork: (providedChainId: string) => Promise<void>;
// }
export default function NetworkButtons() {
    // props: NetworkButtonsPropsIF
    // const { switchNetwork } = props;

    const {
        // chains, error, isLoading, pendingChainId,
        switchNetwork,
    } = useSwitchNetwork();

    const supportedChains = [
        {
            name: 'Görli ',
            id: '0x5',
            icon: '',
            theme: '#36364a',
        },
    ];

    return (
        <div>
            {supportedChains.map((chain, idx) => (
                <NetworkButton
                    key={idx}
                    name={chain.name}
                    icon={chain.icon}
                    theme={chain.theme}
                    id={chain.id}
                    clickHandler={() => {
                        switchNetwork && switchNetwork(parseInt(chain.id));
                    }}
                />
            ))}
        </div>
    );
}
