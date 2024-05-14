import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { useSwitchNetwork } from 'wagmi';
import NetworkButton from './NetworkButton';
import { useContext } from 'react';
import { BrandContext } from '../../../../contexts/BrandContext';
import { chainIds } from '../../../../ambient-utils/types';

export default function NetworkButtons() {
    const { networks } = useContext(BrandContext);

    const { switchNetwork } = useSwitchNetwork();

    const supportedChains = networks.map((network: chainIds) => {
        return {
            name: lookupChain(network).displayName,
            id: network,
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
