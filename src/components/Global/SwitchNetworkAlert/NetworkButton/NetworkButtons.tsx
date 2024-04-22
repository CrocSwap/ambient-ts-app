import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { useSwitchNetwork } from 'wagmi';
import { getSupportedChainIds } from '../../../../ambient-utils/dataLayer';
import NetworkButton from './NetworkButton';

export default function NetworkButtons() {
    const { switchNetwork } = useSwitchNetwork();

    const supportedChains = getSupportedChainIds().map((chainId) => {
        return {
            name: lookupChain(chainId).displayName,
            id: chainId,
            icon: '',
            theme: '#36364a',
        };
    });

    return (
        <div>
            {supportedChains.map((chain, idx) => (
                <NetworkButton
                    key={idx}
                    name={chain.name}
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
