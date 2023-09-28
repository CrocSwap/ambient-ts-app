import { PoolDataIF } from '../../contexts/ExploreContext';
import { PoolIF } from '../../utils/interfaces/PoolIF';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { supportedNetworks } from '../../utils/networks';

// fn to determine if the pool in question has WETH
export default function checkPoolForWETH(
    pool: PoolIF | PoolDataIF,
    chainId: string,
): boolean {
    // check for a canonical WETH address on the current chain
    const addrWETH: string = supportedNetworks[chainId].tokens.WETH;
    // if found then check if either token is WETH
    const checkWETH = (tkn: TokenIF): boolean => {
        return addrWETH
            ? tkn.address.toLowerCase() === addrWETH.toLowerCase()
            : false;
    };
    // return `true` if either token is verified as WETH
    return checkWETH(pool.base) || checkWETH(pool.quote);
}
