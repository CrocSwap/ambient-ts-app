import { LimitOrderIF, TokenIF } from '../../utils/interfaces/exports';

export const getLimitOrderData = async (
    order: LimitOrderIF,
    searchableTokens: TokenIF[],
): Promise<LimitOrderIF> => {
    const baseTokenAddress = order.base;
    const quoteTokenAddress = order.quote;

    const baseTokenLogoURI = searchableTokens.find(
        (token) => token.address.toLowerCase() === baseTokenAddress.toLowerCase(),
    )?.logoURI;
    const quoteTokenLogoURI = searchableTokens.find(
        (token) => token.address.toLowerCase() === quoteTokenAddress.toLowerCase(),
    )?.logoURI;

    order.baseTokenLogoURI = baseTokenLogoURI ?? '';
    order.quoteTokenLogoURI = quoteTokenLogoURI ?? '';

    return order;
};
