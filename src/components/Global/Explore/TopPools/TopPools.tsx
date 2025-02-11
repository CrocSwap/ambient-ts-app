import { Dispatch, memo, SetStateAction } from 'react';
import checkPoolForWETH from '../../../../App/functions/checkPoolForWETH';
import { PoolIF } from '../../../../ambient-utils/types';
import useIsPWA from '../../../../utils/hooks/useIsPWA';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import TooltipComponent from '../../TooltipComponent/TooltipComponent';
import AssignSort from '../AssignSort';
import ExploreToggle from '../ExploreToggle/ExploreToggle';
import PoolRow from '../PoolRow/PoolRow';
import PoolRowSkeleton from '../PoolRow/PoolRowSkeleton';
import {
    SortedPoolMethodsIF,
    sortType,
    useSortedPools,
} from '../useSortedPools';
import styles from './TopPools.module.css';

export type HeaderItem = {
    label: string;
    sortable: boolean;
    pxValue?: number;
    onClick?: () => void;
    tooltipText?: string | JSX.Element;
    classname?: boolean;
};

interface propsIF {
    allPools: Array<PoolIF>;
    goToMarket: (tknA: string, tknB: string) => void;
    isExploreDollarizationEnabled: boolean;
    searchQuery: string;
    setSearchQuery: Dispatch<SetStateAction<string>>;
    view: 'pools' | 'tokens';
    handleToggle(): void;
}

function TopPools(props: propsIF) {
    const {
        allPools,
        goToMarket,
        isExploreDollarizationEnabled,
        searchQuery,
        setSearchQuery,
        view,
        handleToggle,
    } = props;

    const isPWA = useIsPWA();
    // logic to take raw pool list and sort them based on user input
    const sortedPools: SortedPoolMethodsIF = useSortedPools(allPools);
    const desktopView = useMediaQuery('(min-width: 768px)');

    // !important:  any changes to `sortable` values must be accompanied by an update
    // !important:  ... to the type definition `sortType` in `useSortedPools.ts`

    const topPoolsHeaderItems: (HeaderItem | null)[] = [
        !desktopView
            ? null
            : {
                  label: 'Tokens',

                  sortable: false,
                  pxValue: 8,
                  classname: styles.tokens,
              },
        {
            label: desktopView ? 'Pool' : ' Pool',

            sortable: false,
            classname: styles.poolName,
        },
        {
            label: desktopView ? 'Price' : '    Price',
            sortable: false,
            classname: styles.price,
        },
        {
            label: desktopView ? 'TVL' : '    TVL',

            sortable: true,
            tooltipText: 'Total value locked',
        },
        {
            label: '24h Vol.',

            sortable: true,
            tooltipText: 'Total volume in the last 24 hours',
        },
        !desktopView
            ? null
            : {
                  label: 'APR',

                  sortable: true,
                  tooltipText: (
                      <>
                          <div>
                              Annual Percentage Rate (APR) is estimated using
                              the following formula: 24h Fees / TVL × 365
                          </div>
                          <div>{' '}</div>
                          <div>
                              This estimate is based on historical data. Past
                              performance does not guarantee future results.
                          </div>
                      </>
                  ),
              },

        {
            label: desktopView ? '24h Price Δ' : 'Change',

            sortable: true,
            tooltipText: 'The change in price over the last 24 hours',
        },
        {
            label: '',

            sortable: false,
            classname: styles.tradeButton,
        },
    ];

    const headerDisplay = (
        <div className={styles.headerContainer}>
            {topPoolsHeaderItems
                .filter((item): item is HeaderItem => item !== null)
                .map((item: HeaderItem) => {
                    const isActiveSort: boolean =
                        sortedPools.current === item.label.toLowerCase();
                    return (
                        <div
                            key={JSON.stringify(item.label)}
                            className={`${styles.gridHeaderItem} ${item.classname} ${styles.headerItems}`}
                            style={{
                                cursor: item.sortable ? 'pointer' : 'default',
                            }}
                            onClick={() => {
                                item.sortable &&
                                    sortedPools.updateSort(
                                        item.label.toLowerCase() as sortType,
                                    );
                            }}
                        >
                            {item.label}
                            {isActiveSort && (
                                <AssignSort direction={sortedPools.direction} />
                            )}
                            {item.tooltipText && desktopView && (
                                <TooltipComponent
                                    title={item.tooltipText}
                                    placement='right'
                                />
                            )}
                        </div>
                    );
                })}
        </div>
    );
    const tempItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const skeletonDisplay = tempItems.map((item, idx) => (
        <PoolRowSkeleton key={idx} />
    ));

    return (
        <div
            className={styles.mainContainer}
            style={{ marginBottom: isPWA ? '0' : '50px' }}
        >
            <ExploreToggle view={view} handleToggle={handleToggle} />
            {headerDisplay}
            <div className={`${styles.contentContainer} custom_scroll_ambient`}>
                <div className={styles.borderRight} />

                {sortedPools.pools.length ? (
                    sortedPools.pools
                        .filter((pool: PoolIF) => !checkPoolForWETH(pool))
                        .map((pool: PoolIF, idx: number) => (
                            <PoolRow
                                key={idx}
                                pool={pool}
                                goToMarket={goToMarket}
                                isExploreDollarizationEnabled={
                                    isExploreDollarizationEnabled
                                }
                            />
                        ))
                ) : searchQuery ? (
                    <div className={styles.no_results}>
                        No pools match the search query: {searchQuery}
                        <button onClick={() => setSearchQuery('')}>
                            View all Pools
                        </button>
                    </div>
                ) : (
                    skeletonDisplay
                )}
            </div>
        </div>
    );
}

export default memo(TopPools);
