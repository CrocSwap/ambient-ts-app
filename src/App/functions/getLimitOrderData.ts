import { TokenIF } from '../../utils/interfaces/TokenIF';

import { ILimitOrderState } from '../../utils/state/graphDataSlice';

// import { fetchAddress } from './fetchAddress';

export const getLimitOrderData = async (
    order: ILimitOrderState,
    importedTokens: TokenIF[],
): Promise<ILimitOrderState> => {
    const baseTokenAddress = order.base;
    const quoteTokenAddress = order.quote;

    const baseTokenLogoURI = importedTokens.find(
        (token) => token.address.toLowerCase() === baseTokenAddress.toLowerCase(),
    )?.logoURI;
    const quoteTokenLogoURI = importedTokens.find(
        (token) => token.address.toLowerCase() === quoteTokenAddress.toLowerCase(),
    )?.logoURI;

    order.baseTokenLogoURI = baseTokenLogoURI ?? '';
    order.quoteTokenLogoURI = quoteTokenLogoURI ?? '';

    return order;
};
