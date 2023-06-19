import { useCallback, useEffect, useMemo, useState } from 'react';
import { TokenIF } from '../../utils/interfaces/exports';

export interface getRecentTokensParamsIF {
    onCurrentChain?: boolean;
    count?: number | null;
}

export const useRecentTokens = (
    chainId: string,
): {
    addRecentToken: (tkn: TokenIF) => void;
    getRecentTokens: (options?: getRecentTokensParamsIF) => TokenIF[];
    resetRecentTokens: () => void;
} => {
    const [recentTokens, setRecentTokens] = useState<TokenIF[]>([]);

    // hook to reset recent tokens when the user switches chains
    useEffect(() => resetRecentTokens(), [chainId]);

    // fn to add a token to the recentTokens array
    const addRecentToken = useCallback(
        (tkn: TokenIF): void => {
            setRecentTokens([tkn, ...recentTokens]);
        },
        [chainId],
    );

    // fn to return recent tokens from local state
    const getRecentTokens = useMemo(
        () =>
            (
                options: getRecentTokensParamsIF = {
                    onCurrentChain: false,
                    count: null,
                },
            ): TokenIF[] => {
                const relevantTokens = options.onCurrentChain
                    ? recentTokens.filter(
                          (tkn: TokenIF) => tkn.chainId === parseInt(chainId),
                      )
                    : recentTokens;
                return relevantTokens.slice(
                    0,
                    options.count ?? relevantTokens.length + 1,
                );
            },
        [chainId],
    );

    // fn to clear list of recent tokens
    const resetRecentTokens = useCallback(() => {
        setRecentTokens([]);
    }, [chainId]);

    return {
        addRecentToken,
        getRecentTokens,
        resetRecentTokens,
    };
};
