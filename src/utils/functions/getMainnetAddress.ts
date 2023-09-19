import { ZERO_ADDRESS } from '../../constants';
import { NetworkIF } from '../interfaces/NetworkIF';
import { ethereumMainnet } from '../networks/ethereumMainnet';

export const getMainnetAddress = (address: string, network: NetworkIF) => {
    if (address === ZERO_ADDRESS) return ethereumMainnet.tokens['WETH'];
    if (network.chainId === ethereumMainnet.chainId) return address;

    const tokenSymbol = Object.keys(network.tokens).find(
        (key) =>
            network.tokens[key as keyof typeof network.tokens].toLowerCase() ===
            address.toLowerCase(),
    );
    return tokenSymbol
        ? ethereumMainnet.tokens[tokenSymbol as keyof typeof network.tokens]
        : '';
};
