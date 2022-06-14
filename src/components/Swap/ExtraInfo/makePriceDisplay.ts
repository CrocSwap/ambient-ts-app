import { TokenIF } from '../../../utils/interfaces/exports';
import truncateDecimals from '../../../utils/data/truncateDecimals';

export default function makePriceDisplay(
    tokenA:TokenIF,
    tokenB:TokenIF,
    isTokenABase:boolean,
    poolPrice: number,
    didUserFlipDenom: boolean
) {
    const [baseTokenData, quoteTokenData] = isTokenABase
        ? [tokenA, tokenB]
        : [tokenB, tokenA];

    const [expTokenData, cheapTokenData] = poolPrice < 1
        ? [baseTokenData, quoteTokenData]
        : [quoteTokenData, baseTokenData];

    const [firstSymbol, secondSymbol] = didUserFlipDenom
        ? [cheapTokenData.symbol, expTokenData.symbol]
        : [expTokenData.symbol, cheapTokenData.symbol];

    const priceRelationship = poolPrice < 1
        ? (!didUserFlipDenom ? 1 / poolPrice : poolPrice)
        : (!didUserFlipDenom ? poolPrice : 1 / poolPrice);

    const truncPrice = truncateDecimals(priceRelationship, 4);

    return '1 ' + firstSymbol + ' ≈ ' + truncPrice + ' ' + secondSymbol;
};