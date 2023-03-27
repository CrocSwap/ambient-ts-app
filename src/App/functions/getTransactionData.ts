import { TokenIF, TransactionIF } from '../../utils/interfaces/exports';

export const getTransactionData = async (
    tx: TransactionIF,
    tokenList: TokenIF[],
): Promise<TransactionIF> => {
    const baseTokenAddress = tx.base;
    const quoteTokenAddress = tx.quote;

    const baseTokenName = tokenList.find(
        (token) =>
            token.address.toLowerCase() === baseTokenAddress.toLowerCase(),
    )?.name;
    const quoteTokenName = tokenList.find(
        (token) =>
            token.address.toLowerCase() === quoteTokenAddress.toLowerCase(),
    )?.name;

    const baseTokenLogoURI = tokenList.find(
        (token) =>
            token.address.toLowerCase() === baseTokenAddress.toLowerCase(),
    )?.logoURI;
    const quoteTokenLogoURI = tokenList.find(
        (token) =>
            token.address.toLowerCase() === quoteTokenAddress.toLowerCase(),
    )?.logoURI;

    tx.baseName = baseTokenName ?? '';
    tx.quoteName = quoteTokenName ?? '';

    tx.baseTokenLogoURI = baseTokenLogoURI ?? '';
    tx.quoteTokenLogoURI = quoteTokenLogoURI ?? '';

    return tx;
};
