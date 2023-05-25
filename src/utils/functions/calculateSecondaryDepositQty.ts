import { toDisplayPrice } from '@crocswap-libs/sdk';

export const calculateSecondaryDepositQty = (
    poolPriceNonDisplay: number, // the 'scaled' or 'wei' price of the pool
    tokenADecimals: number,
    tokenBDecimals: number,
    primaryInputValueStr: string, // the token quantity entered by the user
    isTokenAPrimary: boolean,
    isTokenABase: boolean,
    isAmbientPosition: boolean,
    depositSkew?: number,
) => {
    const baseDecimals = isTokenABase ? tokenADecimals : tokenBDecimals;
    const quoteDecimals = !isTokenABase ? tokenADecimals : tokenBDecimals;

    const poolDisplayPrice = toDisplayPrice(
        poolPriceNonDisplay,
        baseDecimals,
        quoteDecimals,
    );

    const isPrimaryTokenBase =
        (isTokenAPrimary && isTokenABase) ||
        (!isTokenAPrimary && !isTokenABase);

    let secondaryQuantity;

    const primInputValueNum = parseFloat(primaryInputValueStr);

    if (isAmbientPosition) {
        if (isPrimaryTokenBase) {
            secondaryQuantity = primInputValueNum / poolDisplayPrice;
        } else {
            secondaryQuantity = primInputValueNum / (1 / poolDisplayPrice);
        }
    } else {
        if (depositSkew) {
            if (isPrimaryTokenBase) {
                secondaryQuantity =
                    primInputValueNum / (poolDisplayPrice * depositSkew);
            } else {
                secondaryQuantity =
                    primInputValueNum * (poolDisplayPrice * depositSkew);
            }
        }
    }

    if (secondaryQuantity) {
        if (
            secondaryQuantity === Infinity ||
            secondaryQuantity === -Infinity ||
            isNaN(secondaryQuantity)
        ) {
            return 0;
        } else {
            return secondaryQuantity;
        }
    } else {
        return null;
    }
};
