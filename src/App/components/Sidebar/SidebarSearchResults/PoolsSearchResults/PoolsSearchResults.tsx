import { useNavigate } from 'react-router-dom';
import styles from '../SidebarSearchResults.module.css';
import {
    TokenPairIF,
    TempPoolIF,
} from '../../../../../utils/interfaces/exports';
import { PoolStatsFn } from '../../../../functions/getPoolStats';
import PoolLI from './PoolLI';

interface propsIF {
    searchedPools: TempPoolIF[];
    tokenPair: TokenPairIF;
    chainId: string;
    cachedPoolStatsFetch: PoolStatsFn;
}

export default function PoolsSearchResults(props: propsIF) {
    const { searchedPools, tokenPair, chainId, cachedPoolStatsFetch } = props;

    const navigate = useNavigate();
    const handleClick = (baseAddr: string, quoteAddr: string): void => {
        const { dataTokenA } = tokenPair;
        const tokenAString: string =
            baseAddr.toLowerCase() === dataTokenA.address.toLowerCase()
                ? baseAddr
                : quoteAddr;
        const tokenBString: string =
            baseAddr.toLowerCase() === dataTokenA.address.toLowerCase()
                ? quoteAddr
                : baseAddr;
        navigate(
            '/trade/market/chain=' +
                chainId +
                '&tokenA=' +
                tokenAString +
                '&tokenB=' +
                tokenBString,
        );
    };

    return (
        <div>
            <h4 className={styles.card_title}>Initialized Pools</h4>
            {searchedPools.length ? (
                <>
                    <header className={styles.header}>
                        <div>Pool</div>
                        <div>Volume</div>
                        <div>TVL</div>
                    </header>
                    <ol className={styles.main_result_container}>
                        {searchedPools.slice(0, 4).map((pool: TempPoolIF) => (
                            <PoolLI
                                key={`sidebar_searched_pool_${JSON.stringify(
                                    pool,
                                )}`}
                                chainId={chainId}
                                handleClick={handleClick}
                                pool={pool}
                                cachedPoolStatsFetch={cachedPoolStatsFetch}
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
