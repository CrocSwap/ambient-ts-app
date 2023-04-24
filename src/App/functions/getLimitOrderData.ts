import { LimitOrderIF, TokenIF } from '../../utils/interfaces/exports';
/**
 * Retrieves the logo URI of the base and quote tokens in a given LimitOrderIF object, by searching through an array of searchable tokens.
 * @param order - A LimitOrderIF object representing the order.
 * @param searchableTokens - An array of TokenIF objects that can be searched to find the logos of the base and quote tokens.
 * @returns A Promise that resolves to the original LimitOrderIF object, with the baseTokenLogoURI and quoteTokenLogoURI properties updated to reflect the logo URIs of the base and quote tokens, respectively.
 */
export const getLimitOrderData = async (
    order: LimitOrderIF,
    searchableTokens: TokenIF[],
): Promise<LimitOrderIF> => {
    const baseTokenAddress = order.base;
    const quoteTokenAddress = order.quote;

    // Search for the logo URI of the base token in the array of searchable tokens

    const baseTokenLogoURI = searchableTokens.find(
        (token) =>
            token.address.toLowerCase() === baseTokenAddress.toLowerCase(),
    )?.logoURI;
    // Search for the logo URI of the quote token in the array of searchable tokens

    const quoteTokenLogoURI = searchableTokens.find(
        (token) =>
            token.address.toLowerCase() === quoteTokenAddress.toLowerCase(),
    )?.logoURI;
    // Update the order object with the logo URIs of the base and quote tokens, if they exist

    order.baseTokenLogoURI = baseTokenLogoURI ?? '';
    order.quoteTokenLogoURI = quoteTokenLogoURI ?? '';

    return order;
};
