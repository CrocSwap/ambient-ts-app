import { CrocEnv } from '@crocswap-libs/sdk';
import { useEffect, useState } from 'react';
import { PoolIF, TempPoolIF, TokenIF } from '../../utils/interfaces/exports';
import { FetchContractDetailsFn } from '../functions/fetchContractDetails';
import { fetchPoolList } from '../functions/fetchPoolList';
import { tokenMethodsIF } from './useTokens';

export const usePoolList = (
    cachedTokenDetails: FetchContractDetailsFn,
    tokens: tokenMethodsIF,
    crocEnv?: CrocEnv,
): PoolIF[] => {
    const [poolList, setPoolList] = useState<PoolIF[]>([]);

    useEffect(() => {
        if (!crocEnv) {
            return undefined;
        }

        const pools = fetchPoolList(
            crocEnv,
            tokens.tokenUniv,
            cachedTokenDetails,
        );
        Promise.resolve<TempPoolIF[]>(pools)
            .then((res) => {
                return res
                    .map((result: TempPoolIF) => {
                        const baseToken: TokenIF | undefined =
                            tokens.getTokenByAddress(result.base);
                        const quoteToken: TokenIF | undefined =
                            tokens.getTokenByAddress(result.quote);
                        if (baseToken && quoteToken) {
                            return {
                                base: baseToken,
                                quote: quoteToken,
                                chainId: result.chainId,
                                poolIdx: result.poolIdx,
                            };
                        } else {
                            return null;
                        }
                    })
                    .filter((pool: PoolIF | null) => pool !== null) as PoolIF[];
            })
            .then((pools) => setPoolList(pools))
            .catch((err) => {
                console.error(err);
            });
    }, [crocEnv, tokens.tokenUniv, cachedTokenDetails]);

    return poolList;
};
