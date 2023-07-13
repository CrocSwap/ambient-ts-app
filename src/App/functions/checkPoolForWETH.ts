import { PoolDataIF } from '../../contexts/AnalyticsContext';
import { PoolIF } from '../../utils/interfaces/PoolIF';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { WETH } from '../../utils/tokens/WETH';

// fn to determine if the pool in question has WETH
export default function checkPoolForWETH(
    pool: PoolIF | PoolDataIF,
    chainId: string,
): boolean {
    // check for a canonical WETH address on the current chain
    const addrWETH: string = WETH[chainId as keyof typeof WETH];
    // if found then check if either token is WETH
    const checkWETH = (tkn: TokenIF): boolean => {
        return addrWETH
            ? tkn.address.toLowerCase() === addrWETH.toLowerCase()
            : false;
    };
    // return `true` if either token is verified as WETH
    return checkWETH(pool.base) || checkWETH(pool.quote);
}
