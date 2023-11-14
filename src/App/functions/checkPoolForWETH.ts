import { PoolDataIF } from '../../contexts/ExploreContext';
import { isWethToken } from '../../ambient-utils/src/dataLayer';
import { PoolIF } from '../../ambient-utils/src/types';

// fn to determine if the pool in question has WETH
export default function checkPoolForWETH(pool: PoolIF | PoolDataIF): boolean {
    // check for a canonical WETH address on the current chain
    return isWethToken(pool.base.address) || isWethToken(pool.quote.address);
}
