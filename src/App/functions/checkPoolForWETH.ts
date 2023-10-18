import { PoolDataIF } from '../../contexts/ExploreContext';
import { isWethToken } from '../../utils/data/stablePairs';
import { PoolIF } from '../../utils/interfaces/PoolIF';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { supportedNetworks } from '../../utils/networks';

// fn to determine if the pool in question has WETH
export default function checkPoolForWETH(
    pool: PoolIF | PoolDataIF,
    chainId: string,
): boolean {
    // check for a canonical WETH address on the current chain
    return isWethToken(pool.base.address) || isWethToken(pool.quote.address);
}
