import { TokenIF } from '../../utils/interfaces/TokenIF';

export const findTknByAddr = (addr: string, tokens: Array<TokenIF>) => {
    const tk = tokens.find((tkn: TokenIF) => tkn.address === addr);
    return tk;
};
