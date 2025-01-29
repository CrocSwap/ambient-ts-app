import { CHAIN_SPECS } from '@crocswap-libs/sdk';
import ambientTokenList from '../../constants/ambient-token-list.json';
import testnetTokenList from '../../constants/testnet-token-list.json';
import { TokenIF } from '../../types';

export const findTokenByAddress = (
    address: string,
    chainIdHex: string,
): TokenIF => {
    const isTestnet = CHAIN_SPECS[chainIdHex].isTestNet;
    const relevantTokenList = isTestnet ? testnetTokenList : ambientTokenList;
    return relevantTokenList.tokens.find(
        (token) =>
            token.address.toLowerCase() === address.toLowerCase() &&
            token.chainId === Number(chainIdHex),
    ) as TokenIF;
};
