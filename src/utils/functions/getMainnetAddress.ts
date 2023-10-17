import { ZERO_ADDRESS } from '../../constants';
import { NetworkIF } from '../interfaces/NetworkIF';
import { ethereumMainnet } from '../networks/ethereumMainnet';

export const getMainnetAddress = (address: string, network: NetworkIF) => {
    if (network.tokens.USDC && address === network.tokens.USDC) {
        return ethereumMainnet.tokens['USDC'] as string;
    }
    if (address === network.tokens.WETH || address === ZERO_ADDRESS) {
        return ethereumMainnet.tokens['WETH'] as string;
    }
    return '';
};
