import { useState } from 'react';
import { TokenIF } from '../../utils/interfaces/exports';

export interface ackTokensMethodsIF {
    tokens: TokenIF[];
    acknowledge: (newTkn: TokenIF) => void;
    check: (tkn: TokenIF) => boolean;
    lookup: (addr: string, chn: number|string) => TokenIF | undefined;
}

export const useAckTokens = (): ackTokensMethodsIF => {
    // local storage key for acknowledged tokens array
    const localStorageKey = 'acknowledgedTokens';

    // local state hook to hold array of acknowledged tokens
    // initializes from persisted value or empty array as backup (for new users)
    const [ackTokens, setAckTokens] = useState<TokenIF[]>(
        JSON.parse(localStorage.getItem(localStorageKey) as string) ?? []
    );

    // fn to acknowledge a token
    function acknowledgeToken(newTkn: TokenIF): void {
        const ackTokensWithNewRemoved: TokenIF[] = ackTokens.filter((ackToken: TokenIF) => (
            ackToken.address.toLowerCase() !== newTkn.address.toLowerCase() ||
            ackToken.chainId === newTkn.chainId
        ));
        const updatedAckTokensArray: TokenIF[] = [newTkn, ...ackTokensWithNewRemoved];
        setAckTokens(updatedAckTokensArray);
        localStorage.setItem(
            localStorageKey, JSON.stringify(updatedAckTokensArray)
        );
    }

    // fn to check if a token has been acknowledged
    function checkToken(tkn: TokenIF): boolean {
        return ackTokens.some((ackToken: TokenIF) => (
            ackToken.address.toLowerCase() === tkn.address.toLowerCase() &&
            ackToken.chainId === tkn.chainId
        ));
    }

    function findToken(addr: string, chn: number|string): TokenIF | undefined {
        const chnAsNumber: number = typeof chn === 'string' ? parseInt(chn) : chn;
        return ackTokens.find((ackToken: TokenIF) => 
            ackToken.chainId === chnAsNumber &&
            ackToken.address.toLowerCase() === addr.toLowerCase(),
        );
    }

    return {
        tokens: ackTokens,
        acknowledge: acknowledgeToken,
        check: checkToken,
        lookup: findToken,
    }
}