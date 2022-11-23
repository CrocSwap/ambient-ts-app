import goerliLogo from '../../../../assets/images/networks/goerli.png'; // https://github.com/goerli/goer-logo

// import ethereumLogo from '../../../../assets/images/networks/ethereum.png';

import NetworkButton from './NetworkButton';

interface NetworkButtonsPropsIF {
    switchNetworkInMoralis: (providedChainId: string) => Promise<void>;
}
export default function NetworkButtons(props: NetworkButtonsPropsIF) {
    const { switchNetworkInMoralis } = props;

    const supportedChains = [
        {
            name: 'Görli ',
            id: '0x5',
            icon: goerliLogo,
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
                    clickHandler={() => switchNetworkInMoralis(chain.id)}
                />
            ))}
        </div>
    );
}
