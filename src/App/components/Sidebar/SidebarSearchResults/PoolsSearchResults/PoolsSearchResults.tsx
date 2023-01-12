import PoolLI from './PoolLI';
import ResultSkeleton from '../ResultSkeleton/ResultSkeleton';
import styles from '../SidebarSearchResults.module.css';
import { useClick } from './useClick';
import { TokenIF, TokenPairIF, TempPoolIF } from '../../../../../utils/interfaces/exports';

interface PoolsSearchResultPropsIF {
    searchedPools: TempPoolIF[];
    loading: boolean;
    searchInput: React.ReactNode;
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
    tokenPair: TokenPairIF;
    chainId: string;
}

export default function PoolsSearchResults(props: PoolsSearchResultPropsIF) {
    const { searchedPools, getTokenByAddress, tokenPair, chainId } = props;

    const handleClick = useClick(chainId, tokenPair);

    // TODO:  @Junior make this top-level <div> into an <ol> element and its
    // TODO:  ... children into <li> elements
    const exampleContent = (
        <div className={styles.main_result_container}>
            {
                searchedPools.slice(0,4).map((pool: TempPoolIF) => (
                    <PoolLI
                        key={`sidebar_searched_pool_${JSON.stringify(pool)}`}
                        handleClick={handleClick}
                        pool={pool}
                        getTokenByAddress={getTokenByAddress}
                    />
                ))
            }
        </div>
    );


    // TODO:  @Junior make the header <div> into a <header> element

    return (
        <div>
            <div className={styles.card_title}>Pools</div>
            <div className={styles.header}>
                <div>Pool</div>
                <div>Price</div>
                <div>Change</div>
            </div>
            {props.loading ? <ResultSkeleton /> : exampleContent}
        </div>
    );
}
