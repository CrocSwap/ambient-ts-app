// import goerliLogo from '../../../../assets/images/networks/goerli.png';
// https://github.com/goerli/goer-logo

// import ethereumLogo from '../../../../assets/images/networks/ethereum.png';

import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { useSwitchNetwork } from 'wagmi';
// import { getSupportedChainIds } from '../../../../ambient-utils/dataLayer';
import NetworkButton from './NetworkButton';
import { useContext } from 'react';
import { BrandContext } from '../../../../contexts/BrandContext';
import { chainIds } from '../../../../ambient-utils/types';

// interface NetworkButtonsPropsIF {
//     switchNetwork: (providedChainId: string) => Promise<void>;
// }
export default function NetworkButtons() {
    const { networks } = useContext(BrandContext);

    const {
        // chains, error, isLoading, pendingChainId,
        switchNetwork,
    } = useSwitchNetwork();

    // const supportedChains = getSupportedChainIds().map((chainId) => {
    //     return {
    //         name: lookupChain(chainId).displayName,
    //         id: chainId,
    //         icon: '',
    //         theme: '#36364a',
    //     };
    // });

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
