export const getSymbols = (
    isDenomBase: boolean,
    baseSymbol: string,
    quoteSymbol: string,
) => {
    return isDenomBase
        ? `${baseSymbol} / ${quoteSymbol}`
        : `${quoteSymbol} / ${baseSymbol}`;
};
