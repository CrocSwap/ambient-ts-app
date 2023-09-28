export function translateMainnetForGraphcache(
    baseToken: string,
    quoteToken: string,
): { baseToken: string; quoteToken: string } {
    const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
    const ZERO = '0x0000000000000000000000000000000000000000';
    if (baseToken === WETH) {
        return { baseToken: ZERO, quoteToken: quoteToken };
    } else if (quoteToken === WETH) {
        return { baseToken: ZERO, quoteToken: baseToken };
    } else {
        return { baseToken: baseToken, quoteToken: quoteToken };
    }
}
