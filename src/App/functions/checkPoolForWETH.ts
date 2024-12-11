import { isWrappedNativeToken } from '../../ambient-utils/dataLayer';
import { PoolDataIF, PoolIF } from '../../ambient-utils/types';

// fn to determine if the pool in question has WETH
export default function checkPoolForWETH(pool: PoolIF | PoolDataIF): boolean {
    // check for a canonical WETH address on the current chain
    return (
        isWrappedNativeToken(pool.base.address) ||
        isWrappedNativeToken(pool.quote.address)
    );
}
