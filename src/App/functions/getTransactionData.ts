import { TokenIF } from '../../utils/interfaces/TokenIF';

import { ITransaction } from '../../utils/state/graphDataSlice';

// import { fetchAddress } from './fetchAddress';

export const getTransactionData = async (
    tx: ITransaction,
    importedTokens: TokenIF[],
): Promise<ITransaction> => {
    const baseTokenAddress = tx.base;
    const quoteTokenAddress = tx.quote;

    const baseTokenLogoURI = importedTokens.find(
        (token) => token.address.toLowerCase() === baseTokenAddress.toLowerCase(),
    )?.logoURI;
    const quoteTokenLogoURI = importedTokens.find(
        (token) => token.address.toLowerCase() === quoteTokenAddress.toLowerCase(),
    )?.logoURI;

    tx.baseTokenLogoURI = baseTokenLogoURI ?? '';
    tx.quoteTokenLogoURI = quoteTokenLogoURI ?? '';

    return tx;
};
