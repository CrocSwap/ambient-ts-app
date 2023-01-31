import { useNavigate } from 'react-router-dom';

// START: Import Local Files
import PoolLI from './PoolLI';
import styles from '../SidebarSearchResults.module.css';
import { TokenIF, TokenPairIF, TempPoolIF } from '../../../../../utils/interfaces/exports';
import { PoolStatsFn } from '../../../../functions/getPoolStats';

interface propsIF {
    searchedPools: TempPoolIF[];
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
    tokenPair: TokenPairIF;
    chainId: string;
    cachedPoolStatsFetch: PoolStatsFn;
}

export default function PoolsSearchResults(props: propsIF) {
    const { searchedPools, getTokenByAddress, tokenPair, chainId, cachedPoolStatsFetch } = props;

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
            <div className={styles.header}>
                <div>Pool</div>
                <div>Volume</div>
                <div>TVL</div>
            </div>
            {searchedPools.length ? (
                <div className={styles.main_result_container}>
                    {searchedPools.slice(0, 4).map((pool: TempPoolIF) => (
                        <PoolLI
                            key={`sidebar_searched_pool_${JSON.stringify(pool)}`}
                            chainId={chainId}
                            handleClick={handleClick}
                            pool={pool}
                            getTokenByAddress={getTokenByAddress}
                            cachedPoolStatsFetch={cachedPoolStatsFetch}
                        />
                    ))}
                </div>
            ) : (
                <h5>No Pools Found</h5>
            )}
        </div>
    );
}
