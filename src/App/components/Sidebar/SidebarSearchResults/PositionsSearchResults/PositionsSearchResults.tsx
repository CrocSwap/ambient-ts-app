import styles from '../SidebarSearchResults.module.css';
import loadingSpinner from '../../../../../assets/animations/loading_spinner.svg';
import { load } from 'redux-localstorage-simple';
import ResultSkeleton from '../ResultSkeleton/ResultSkeleton';

interface PositionsSearchResultPropsIF {
    loading: boolean;
}
export default function PositionsSearchResults(props: PositionsSearchResultPropsIF) {
    function PositionSearchResult() {
        return (
            <div className={styles.card_container}>
                <div>Pool</div>
                <div>Price</div>
                <div>Qty</div>
            </div>
        );
    }

    const header = (
        <div className={styles.header}>
            <div>Pool</div>
            <div>Price</div>
            <div>Change</div>
        </div>
    );

    const exampleContent = (
        <div className={styles.main_result_container}>
            {new Array(5).fill(null).map((item, idx) => (
                <PositionSearchResult key={idx} />
            ))}
        </div>
    );

    const loadingSpinnerDisplay = (
        <div className={styles.loading_spinner}>
            <img src={loadingSpinner} alt='loading...' />
        </div>
    );

    console.log(props.loading);
    return (
        <div>
            <div className={styles.card_title}>Range Positions</div>
            {header}

            {props.loading ? <ResultSkeleton /> : exampleContent}
        </div>
    );
}
