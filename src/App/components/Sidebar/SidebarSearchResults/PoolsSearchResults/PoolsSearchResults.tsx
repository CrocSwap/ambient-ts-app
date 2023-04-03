import { useNavigate } from 'react-router-dom';
import styles from '../SidebarSearchResults.module.css';
import {
    TokenIF,
    TokenPairIF,
    TempPoolIF,
} from '../../../../../utils/interfaces/exports';
import { PoolStatsFn } from '../../../../functions/getPoolStats';
import PoolLI from './PoolLI';
import { ackTokensMethodsIF } from '../../../../hooks/useAckTokens';

interface propsIF {
    searchedPools: TempPoolIF[];
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
    tokenPair: TokenPairIF;
    chainId: string;
    cachedPoolStatsFetch: PoolStatsFn;
    ackTokens: ackTokensMethodsIF;
}

export default function PoolsSearchResults(props: propsIF) {
    const {
        searchedPools,
        getTokenByAddress,
        tokenPair,
        chainId,
        cachedPoolStatsFetch,
        ackTokens,
    } = props;

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
                                getTokenByAddress={getTokenByAddress}
                                cachedPoolStatsFetch={cachedPoolStatsFetch}
                                ackTokens={ackTokens}
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
