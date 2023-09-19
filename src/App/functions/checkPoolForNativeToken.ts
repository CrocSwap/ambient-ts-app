import { PoolDataIF } from '../../contexts/ExploreContext';
import { PoolIF } from '../../utils/interfaces/PoolIF';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { supportedNetworks } from '../../utils/networks';

// fn to determine if the pool in question has wrapped native token
export default function checkPoolForNativeToken(
    pool: PoolIF | PoolDataIF,
    chainId: string,
): boolean {
    const check = (tkn: TokenIF): boolean => {
        return !!supportedNetworks[chainId].wrappedNativeTokens.find(
            (addr) => addr.toLowerCase() === tkn.address.toLowerCase(),
        );
    };
    // return `true` if either token is verified as wrapped native token
    return check(pool.base) || check(pool.quote);
}
