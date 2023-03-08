import { useNavigate } from 'react-router-dom';

// START: Import Local Files
import PoolLI from './PoolLI';
import styles from '../SidebarSearchResults.module.css';
import { TokenPairIF, TempPoolIF } from '../../../../../utils/interfaces/exports';
import { PoolStatsFn } from '../../../../functions/getPoolStats';
import { tokenMethodsIF } from '../../../../hooks/useToken';

interface propsIF {
    searchedPools: TempPoolIF[];
    tokenPair: TokenPairIF;
    chainId: string;
    cachedPoolStatsFetch: PoolStatsFn;
    uTokens: tokenMethodsIF;
}

export default function PoolsSearchResults(props: propsIF) {
    const { searchedPools, tokenPair, chainId, cachedPoolStatsFetch, uTokens } = props;

    const navigate = useNavigate();
    const handleClick = (baseAddr: string, quoteAddr: string): void => {
        const { dataTokenA } = tokenPair;
        const tokenAString: string =
            baseAddr.toLowerCase() === dataTokenA.address.toLowerCase() ? baseAddr : quoteAddr;
        const tokenBString: string =
            baseAddr.toLowerCase() === dataTokenA.address.toLowerCase() ? quoteAddr : baseAddr;
        navigate(
            '/trade/market/chain=' +
            chainId +
            '&tokenA=' +
            tokenAString +
            '&tokenB=' +
            tokenBString,
        );
    };

    // TODO:  @Junior make this top-level <div> into an <ol> element and its
    // TODO:  ... children into <li> elements
    // TODO:  @Junior make the header <div> into a <header> element
    // TODO: @Junior also change `Initialized Pools` to an `<h1-6>` elem

    return (
        <div>
            <div className={styles.card_title}>Initialized Pools</div>
            {searchedPools.length ? (
                <>
                    <div className={styles.header}>
                        <div>Pool</div>
                        <div>Volume</div>
                        <div>TVL</div>
                    </div>
                    <div className={styles.main_result_container}>
                        {searchedPools.slice(0, 4).map((pool: TempPoolIF) => (
                            <PoolLI
                                key={`sidebar_searched_pool_${JSON.stringify(pool)}`}
                                chainId={chainId}
                                handleClick={handleClick}
                                pool={pool}
                                cachedPoolStatsFetch={cachedPoolStatsFetch}
                                uTokens={uTokens}
                            />
                        ))}
                    </div>
                </>
            ) : (
                <h5 className={styles.not_found_text}>No Pools Found</h5>
            )}
        </div>
    );
}
