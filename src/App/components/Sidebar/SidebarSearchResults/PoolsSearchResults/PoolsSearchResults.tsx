import ResultSkeleton from '../ResultSkeleton/ResultSkeleton';
import styles from '../SidebarSearchResults.module.css';
import { TokenIF, TempPoolIF } from '../../../../../utils/interfaces/exports';

interface PoolsSearchResultPropsIF {
    searchedPools: TempPoolIF[];
    loading: boolean;
    searchInput: React.ReactNode;
}

export default function PoolsSearchResults(props: PoolsSearchResultPropsIF) {
    const { searchedPools } = props;

    console.log(searchedPools.length);

    // TODO:  @Junior make this top-level <div> into an <ol> element and its
    // TODO:  ... children into <li> elements
    const exampleContent = (
        <div className={styles.main_result_container}>
            {
                searchedPools.map((pool: TempPoolIF) => (
                    <div
                        key={`sidebar_searched_pool_${JSON.stringify(pool)}`}
                        className={styles.card_container}
                    >
                        <div>{pool.quoteSymbol}</div>
                        <div>Price</div>
                        <div>Gain</div>
                    </div>
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
