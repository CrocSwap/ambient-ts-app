import { supportedNetworks } from '../../constants';
import { PoolIF } from '../../types';

export function getDefaultTopPools(chainId: string): PoolIF[] {
    return supportedNetworks[chainId].topPools;
}
