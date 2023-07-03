import { CrocEnv } from '@crocswap-libs/sdk';
import { useContext, useEffect, useState } from 'react';
import {
    PoolIF,
    TempPoolServerIF,
    TokenIF,
} from '../../utils/interfaces/exports';
import { fetchPoolList } from '../functions/fetchPoolList';
import { TokenContext } from '../../contexts/TokenContext';

export const usePoolList = (crocEnv?: CrocEnv): PoolIF[] => {
    const {
        tokens: { verifyToken, getTokenByAddress, tokenUniv },
    } = useContext(TokenContext);

    const [poolList, setPoolList] = useState<PoolIF[]>([]);

    useEffect(() => {
        if (!crocEnv) {
            return undefined;
        }

        const pools = fetchPoolList(crocEnv);
        Promise.resolve<TempPoolServerIF[]>(pools)
            .then((res) => {
                return res
                    .filter(
                        (result: TempPoolServerIF) =>
                            verifyToken(result.base) &&
                            verifyToken(result.quote),
                    )
                    .map((result: TempPoolServerIF) => {
                        const baseToken: TokenIF | undefined =
                            getTokenByAddress(result.base);
                        const quoteToken: TokenIF | undefined =
                            getTokenByAddress(result.quote);
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
            .then((pools) => {
                setPoolList(pools);
                console.log(pools);
            })
            .catch((err) => {
                console.error(err);
            });
    }, [crocEnv, tokenUniv]);

    return poolList;
};
