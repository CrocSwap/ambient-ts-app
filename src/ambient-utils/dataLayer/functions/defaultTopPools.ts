import { PoolIF } from '../../types';
import { supportedNetworks } from '../../constants';

export function getDefaultTopPools(chainId: string): PoolIF[] {
    return supportedNetworks[chainId].topPools;
}
