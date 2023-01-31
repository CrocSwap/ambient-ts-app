export const getDisplayPrice = (symbol: string, limitOrder: number): string => {
    const nonTruncatedPrice = limitOrder;
    const truncatedPrice =
        nonTruncatedPrice < 2
            ? nonTruncatedPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : nonTruncatedPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });
    return symbol + truncatedPrice;
};
