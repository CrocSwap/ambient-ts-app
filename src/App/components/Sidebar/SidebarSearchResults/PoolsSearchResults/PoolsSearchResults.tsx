import styles from '../SidebarSearchResults.module.css';
import { PoolIF } from '../../../../../utils/interfaces/exports';
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
import checkPoolForWETH from '../../../../functions/checkPoolForWETH';

interface propsIF {
    searchedPools: PoolIF[];
    cachedPoolStatsFetch: PoolStatsFn;
    cachedFetchTokenPrice: TokenPriceFn;
}

export default function PoolsSearchResults(props: propsIF) {
    const { searchedPools, cachedPoolStatsFetch, cachedFetchTokenPrice } =
        props;
    const { tokenA } = useAppSelector((state) => state.tradeData);
    const {
        crocEnv,
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    // hook to generate navigation actions with pre-loaded path
    const linkGenMarket: linkGenMethodsIF = useLinkGen('market');

    // fn to handle user clicks on `<PoolLI />` instances
    const handleClick = (baseAddr: string, quoteAddr: string): void => {
        // reorganize base and quote tokens as tokenA and tokenB
        const [addrTokenA, addrTokenB] =
            baseAddr.toLowerCase() === tokenA.address.toLowerCase()
                ? [baseAddr, quoteAddr]
                : [quoteAddr, baseAddr];
        // navigate user to the new appropriate URL path
        linkGenMarket.navigate({
            chain: chainId,
            tokenA: addrTokenA,
            tokenB: addrTokenB,
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
                            .filter(
                                (pool: PoolIF) =>
                                    !checkPoolForWETH(pool, chainId),
                            )
                            // max five elements before content overflows container
                            .slice(0, 5)
                            .map((pool: PoolIF) => (
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
