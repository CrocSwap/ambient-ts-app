export const getDisplayableEffectivePriceString = (
    effectivePriceWithDenom: number | undefined,
) => {
    if (
        !effectivePriceWithDenom ||
        effectivePriceWithDenom === Infinity ||
        effectivePriceWithDenom === 0
    ) {
        return '…';
    } else if (effectivePriceWithDenom < 0.0001) {
        return effectivePriceWithDenom.toExponential(2);
    } else {
        const maxDigits = effectivePriceWithDenom < 2 ? 6 : 2;
        return effectivePriceWithDenom.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: maxDigits,
        });
    }
};
