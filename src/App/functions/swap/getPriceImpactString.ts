export const getPriceImpactString = (priceImpactNum: number | undefined) => {
    if (!priceImpactNum) {
        return '…';
    } else {
        const fractionDigits = priceImpactNum >= 100 ? 0 : 2;
        return priceImpactNum.toLocaleString(undefined, {
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits,
        });
    }
};
