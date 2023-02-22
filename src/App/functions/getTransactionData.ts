import { TokenIF, TransactionIF } from '../../utils/interfaces/exports';

export const getTransactionData = async (
    tx: TransactionIF,
    tokenList: TokenIF[],
): Promise<TransactionIF> => {
    // console.log({ tokenList });
    const baseTokenAddress = tx.base;
    const quoteTokenAddress = tx.quote;

    // const baseKey = baseTokenAddress.toLowerCase() + '_' + tx.chainId;
    // const quoteKey = quoteTokenAddress.toLowerCase() + '_' + tx.chainId;

    // const baseTokenName = tokensOnActiveLists.get(baseKey)?.name;
    // const quoteTokenName = tokensOnActiveLists.get(quoteKey)?.name;

    const baseTokenName = tokenList.find(
        (token) => token.address.toLowerCase() === baseTokenAddress.toLowerCase(),
    )?.name;
    const quoteTokenName = tokenList.find(
        (token) => token.address.toLowerCase() === quoteTokenAddress.toLowerCase(),
    )?.name;

    const baseTokenLogoURI = tokenList.find(
        (token) => token.address.toLowerCase() === baseTokenAddress.toLowerCase(),
    )?.logoURI;
    const quoteTokenLogoURI = tokenList.find(
        (token) => token.address.toLowerCase() === quoteTokenAddress.toLowerCase(),
    )?.logoURI;
    // const baseTokenLogoURI = tokensOnActiveLists.get(baseKey)?.logoURI;
    // const quoteTokenLogoURI = tokensOnActiveLists.get(quoteKey)?.logoURI;

    tx.baseName = baseTokenName ?? '';
    tx.quoteName = quoteTokenName ?? '';

    tx.baseTokenLogoURI = baseTokenLogoURI ?? '';
    tx.quoteTokenLogoURI = quoteTokenLogoURI ?? '';

    return tx;
};
