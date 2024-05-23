// used for determining whether to reverse default tokens in TradeDataContext and CrocEnvContext
export function translateTokenSymbol(symbol: string): string {
    return symbol.toUpperCase() === 'USDB' ? 'USDC' : symbol.toUpperCase();
}
