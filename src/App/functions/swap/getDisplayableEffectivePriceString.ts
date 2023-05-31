export const getDisplayableEffectivePriceString = (
    effectivePriceWithDenom: number | undefined,
) => {
    if (
        !effectivePriceWithDenom ||
        effectivePriceWithDenom === Infinity ||
        effectivePriceWithDenom === 0
    ) {
        return '…';
    } else {
        const maxDigits = effectivePriceWithDenom < 2 ? 2 : 6;
        return effectivePriceWithDenom.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: maxDigits,
        });
    }
};
