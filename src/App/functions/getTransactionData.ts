import { TokenIF } from '../../utils/interfaces/TokenIF';

import { ITransaction } from '../../utils/state/graphDataSlice';

// import { fetchAddress } from './fetchAddress';

export const getTransactionData = async (
    tx: ITransaction,
    tokensOnActiveLists: Map<string, TokenIF>,
): Promise<ITransaction> => {
    const baseTokenAddress = tx.base;
    const quoteTokenAddress = tx.quote;

    const baseKey = baseTokenAddress.toLowerCase() + '_' + tx.chainId;
    const quoteKey = quoteTokenAddress.toLowerCase() + '_' + tx.chainId;

    const baseTokenName = tokensOnActiveLists.get(baseKey)?.name;
    const quoteTokenName = tokensOnActiveLists.get(quoteKey)?.name;

    const baseTokenLogoURI = tokensOnActiveLists.get(baseKey)?.logoURI;
    const quoteTokenLogoURI = tokensOnActiveLists.get(quoteKey)?.logoURI;

    tx.baseName = baseTokenName ?? '';
    tx.quoteName = quoteTokenName ?? '';

    tx.baseTokenLogoURI = baseTokenLogoURI ?? '';
    tx.quoteTokenLogoURI = quoteTokenLogoURI ?? '';

    return tx;
};
