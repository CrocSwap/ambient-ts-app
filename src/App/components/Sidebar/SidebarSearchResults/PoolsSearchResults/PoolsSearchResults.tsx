import styles from '../SidebarSearchResults.module.css';
import { TempPoolIF, TokenIF } from '../../../../../utils/interfaces/exports';
import { PoolStatsFn } from '../../../../functions/getPoolStats';
import PoolLI from './PoolLI';
import { useContext } from 'react';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';
import {
    useLinkGen,
    linkGenMethodsIF,
} from '../../../../../utils/hooks/useLinkGen';
import { TokenPriceFn } from '../../../../functions/fetchTokenPrice';
import { TokenContext } from '../../../../../contexts/TokenContext';
import { tokenListURIs } from '../../../../../utils/data/tokenListURIs';

interface propsIF {
    searchedPools: TempPoolIF[];
    cachedPoolStatsFetch: PoolStatsFn;
    cachedFetchTokenPrice: TokenPriceFn;
}

export default function PoolsSearchResults(props: propsIF) {
    const { searchedPools, cachedPoolStatsFetch, cachedFetchTokenPrice } =
        props;
    const { tokenA } = useAppSelector((state) => state.tradeData);
    const { tokens } = useContext(TokenContext);
    const ambientAddresses: string[] = tokens
        .getTokensFromList(tokenListURIs.ambient)
        .map((tkn: TokenIF) => tkn.address.toLowerCase());
    const {
        crocEnv,
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    // hook to generate navigation actions with pre-loaded path
    const linkGenMarket: linkGenMethodsIF = useLinkGen('market');

    const handleClick = (baseAddr: string, quoteAddr: string): void => {
        const tokenAString: string =
            baseAddr.toLowerCase() === tokenA.address.toLowerCase()
                ? baseAddr
                : quoteAddr;
        const tokenBString: string =
            baseAddr.toLowerCase() === tokenA.address.toLowerCase()
                ? quoteAddr
                : baseAddr;
        linkGenMarket.navigate({
            chain: chainId,
            tokenA: tokenAString,
            tokenB: tokenBString,
        });
    };

    return (
        <div>
            <h4 className={styles.card_title}>Pools</h4>
            {searchedPools.length ? (
                <>
                    <header className={styles.header}>
                        <div>Pool</div>
                        <div>Volume</div>
                        <div>TVL</div>
                    </header>
                    <ol className={styles.main_result_container}>
                        {searchedPools
                            .sort((poolA: TempPoolIF, poolB: TempPoolIF) => {
                                const checkPriority = (pool: TempPoolIF) => {
                                    let output = 0;
                                    ambientAddresses.includes(
                                        pool.baseToken.address.toLowerCase(),
                                    ) && output++;
                                    ambientAddresses.includes(
                                        pool.quoteToken.address.toLowerCase(),
                                    ) && output++;
                                    return output;
                                };
                                return (
                                    checkPriority(poolB) - checkPriority(poolA)
                                );
                            })
                            .slice(0, 4)
                            .map((pool: TempPoolIF) => (
                                <PoolLI
                                    key={`sidebar_searched_pool_${JSON.stringify(
                                        pool,
                                    )}`}
                                    handleClick={handleClick}
                                    pool={pool}
                                    cachedPoolStatsFetch={cachedPoolStatsFetch}
                                    cachedFetchTokenPrice={
                                        cachedFetchTokenPrice
                                    }
                                    crocEnv={crocEnv}
                                />
                            ))}
                    </ol>
                </>
            ) : (
                <h5 className={styles.not_found_text}>No Pools Found</h5>
            )}
        </div>
    );
}
