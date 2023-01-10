import PoolLI from './PoolLI';
import ResultSkeleton from '../ResultSkeleton/ResultSkeleton';
import styles from '../SidebarSearchResults.module.css';
import { TokenIF, TempPoolIF } from '../../../../../utils/interfaces/exports';

interface PoolsSearchResultPropsIF {
    searchedPools: TempPoolIF[];
    loading: boolean;
    searchInput: React.ReactNode;
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
}

export default function PoolsSearchResults(props: PoolsSearchResultPropsIF) {
    const { searchedPools, getTokenByAddress } = props;

    // TODO:  @Junior make this top-level <div> into an <ol> element and its
    // TODO:  ... children into <li> elements
    const exampleContent = (
        <div className={styles.main_result_container}>
            {
                searchedPools.map((pool: TempPoolIF) => (
                    <PoolLI
                        key={`sidebar_searched_pool_${JSON.stringify(pool)}`}
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
