import optimisticImage from '../../../../assets/images/networks/optimistic.svg';
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
            icon: optimisticImage,
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
