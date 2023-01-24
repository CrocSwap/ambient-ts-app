import PoolLI from './PoolLI';
import styles from '../SidebarSearchResults.module.css';
import { useClick } from './useClick';
import { TokenIF, TokenPairIF, TempPoolIF } from '../../../../../utils/interfaces/exports';
import { PoolStatsFn } from '../../../../functions/getPoolStats';

interface PoolsSearchResultPropsIF {
    searchedPools: TempPoolIF[];
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
    tokenPair: TokenPairIF;
    chainId: string;
    cachedPoolStatsFetch: PoolStatsFn;
}

export default function PoolsSearchResults(props: PoolsSearchResultPropsIF) {
    const {
        searchedPools,
        getTokenByAddress,
        tokenPair,
        chainId,
        cachedPoolStatsFetch
    } = props;

    // fn to handle programmatic navigation when user clicks a pool in the DOM
    // this is a hook because it needs the useLocation() and useNavigate() hooks
    const handleClick = useClick(chainId, tokenPair);

    // TODO:  @Junior make this top-level <div> into an <ol> element and its
    // TODO:  ... children into <li> elements

    // TODO:  @Junior make the header <div> into a <header> element

    return (
        <div>
            <div className={styles.card_title}>Pools</div>
            <div className={styles.header}>
                <div>Pool</div>
                <div>Volume</div>
                <div>TVL</div>
            </div>
            <div className={styles.main_result_container}>
            {
                searchedPools.slice(0,4).map((pool: TempPoolIF) => (
                    <PoolLI
                        key={`sidebar_searched_pool_${JSON.stringify(pool)}`}
                        chainId={chainId}
                        handleClick={handleClick}
                        pool={pool}
                        getTokenByAddress={getTokenByAddress}
                        cachedPoolStatsFetch={cachedPoolStatsFetch}
                    />
                ))
            }
        </div>
        </div>
    );
}
