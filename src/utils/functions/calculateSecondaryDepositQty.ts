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
    // console.log(tokenADecimals, tokenBDecimals);
    const baseDecimals = isTokenABase ? tokenADecimals : tokenBDecimals;
    const quoteDecimals = !isTokenABase ? tokenADecimals : tokenBDecimals;

    const poolDisplayPrice = toDisplayPrice(poolPriceNonDisplay, baseDecimals, quoteDecimals);

    const isPrimaryTokenBase =
        (isTokenAPrimary && isTokenABase) || (!isTokenAPrimary && !isTokenABase);

    // console.log({
    //     baseDecimals,
    //     quoteDecimals,
    //     isAmbientPosition,
    //     poolPriceNonDisplay,
    //     poolDisplayPrice,
    //     isTokenAPrimary,
    //     isTokenABase,
    //     depositSkew,
    //     isPrimaryTokenBase,
    //     primaryInputValueStr,
    // });

    let secondaryQuantity;

    const primInputValueNum = parseFloat(primaryInputValueStr);

    // TODO: activate code with ternaries once function is tested in DOM
    // if (isAmbientPosition) {
    //     secondaryQuantity = isPrimaryTokenBase
    //         ? primInputValueNum / poolDisplayPrice
    //         : primInputValueNum / (1 / poolDisplayPrice);
    // } else {
    //     if (depositSkew) {
    //         secondaryQuantity = isPrimaryTokenBase
    //             ? (primInputValueNum / poolDisplayPrice) * depositSkew
    //             : (primInputValueNum / (1 / poolDisplayPrice)) * depositSkew;
    //     }
    // }

    if (isAmbientPosition) {
        if (isPrimaryTokenBase) {
            secondaryQuantity = primInputValueNum / poolDisplayPrice;
        } else {
            secondaryQuantity = primInputValueNum / (1 / poolDisplayPrice);
        }
    } else {
        if (depositSkew) {
            if (isPrimaryTokenBase) {
                secondaryQuantity = (primInputValueNum / poolDisplayPrice) * depositSkew;
            } else {
                secondaryQuantity = (primInputValueNum / (1 / poolDisplayPrice)) * depositSkew;
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
