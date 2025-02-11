import { isWrappedNativeToken } from '../../ambient-utils/dataLayer';
import { PoolIF } from '../../ambient-utils/types';

// fn to determine if the pool in question has WETH
export default function checkPoolForWETH(pool: PoolIF): boolean {
    // check for a canonical WETH address on the current chain
    return isWrappedNativeToken(pool.base) || isWrappedNativeToken(pool.quote);
}
