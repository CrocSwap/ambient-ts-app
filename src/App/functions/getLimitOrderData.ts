import { LimitOrderIF, TokenIF } from '../../utils/interfaces/exports';

export const getLimitOrderData = async (
    order: LimitOrderIF,
    tokensOnChain: TokenIF[],
): Promise<LimitOrderIF> => {
    const baseTokenAddress = order.base;
    const quoteTokenAddress = order.quote;

    const baseTokenLogoURI = tokensOnChain.find(
        (token) =>
            token.address.toLowerCase() === baseTokenAddress.toLowerCase(),
    )?.logoURI;
    const quoteTokenLogoURI = tokensOnChain.find(
        (token) =>
            token.address.toLowerCase() === quoteTokenAddress.toLowerCase(),
    )?.logoURI;

    order.baseTokenLogoURI = baseTokenLogoURI ?? '';
    order.quoteTokenLogoURI = quoteTokenLogoURI ?? '';

    return order;
};
