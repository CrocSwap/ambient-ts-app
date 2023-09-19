import { ZERO_ADDRESS } from '../../constants';
import { NetworkIF } from '../interfaces/NetworkIF';
import { supportedNetworks } from '../networks';

export const getMainnetAddress = (address: string, network: NetworkIF) => {
    if (network.mainnetChainId === network.chainId) return address;

    const mainnet = supportedNetworks[network.mainnetChainId];

    if (address === ZERO_ADDRESS) return mainnet.tokens['WETH'];

    const tokenSymbol = Object.keys(network.tokens).find(
        (key) =>
            network.tokens[key as keyof typeof network.tokens].toLowerCase() ===
            address.toLowerCase(),
    );
    return tokenSymbol
        ? mainnet.tokens[tokenSymbol as keyof typeof network.tokens]
        : '';
};
