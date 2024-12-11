import { Dispatch, memo, SetStateAction, useContext } from 'react';
import { isWrappedNativeToken } from '../../../../ambient-utils/dataLayer';
import { SinglePoolDataIF } from '../../../../ambient-utils/types';
import { ChainDataContext } from '../../../../contexts';
import { dexTokenData } from '../../../../pages/platformAmbient/Explore/useTokenStats';
import useIsPWA from '../../../../utils/hooks/useIsPWA';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import TooltipComponent from '../../TooltipComponent/TooltipComponent';
import AssignSort from '../AssignSort';
import ExploreToggle from '../ExploreToggle/ExploreToggle';
import TokenRow from '../TokenRow/TokenRow';
import TokenRowSkeleton from '../TokenRow/TokenRowSkeleton';
import { sortedDexTokensIF, useSortedDexTokens } from '../useSortedDexTokens';
import styles from './DexTokens.module.css';

export type columnSlugs =
    | 'token'
    | 'name'
    | 'tvl'
    | 'fees'
    | 'volume'
    | 'tradeBtn';

interface HeaderItem {
    label: string;
    slug: columnSlugs;
    sortable: boolean;
    pxValue?: number;
    onClick?: () => void;
    tooltipText?: string | JSX.Element;
    classname?: boolean;
}

interface propsIF {
    dexTokens: dexTokenData[];
    chainId: string;
    goToMarket: (tknA: string, tknB: string) => void;
    searchQuery: string;
    setSearchQuery: Dispatch<SetStateAction<string>>;
    view: 'pools' | 'tokens';
    handleToggle(): void;
}

function DexTokens(props: propsIF) {
    const {
        dexTokens,
        goToMarket,
        searchQuery,
        setSearchQuery,
        view,
        handleToggle,
    } = props;

    const { allPoolStats } = useContext(ChainDataContext);

    const isPWA = useIsPWA();

    const sortedTokens: sortedDexTokensIF = useSortedDexTokens(dexTokens);

    const desktopView = useMediaQuery('(min-width: 768px)');
    // this logic is here to patch cases where existing logic to identify a token pool fails,
    // ... this is not an optimal location but works as a stopgap that minimizes needing to
    // ... alter existing logic or type annotation in the component tree

    const dexTokensHeaderItems: (HeaderItem | null)[] = [
        // mobileScrenView ? null :
        {
            label: 'Token',
            slug: 'token',
            sortable: false,
            classname: styles.tokens,
        },
        desktopView
            ? {
                  label: 'Name',
                  slug: 'name',
                  sortable: true,
                  classname: styles.poolName,
              }
            : null,
        {
            label: 'Volume',
            slug: 'volume',
            sortable: true,
            tooltipText: 'Total trade volume',
        },
        {
            label: 'TVL',
            slug: 'tvl',
            sortable: true,
            tooltipText: 'Total value locked',
        },
        {
            label: 'Fees',
            slug: 'fees',
            sortable: true,
            tooltipText: 'Total fees collected',
        },
        {
            label: '',
            slug: 'tradeBtn',

            sortable: false,
        },
    ];

    const headerDisplay = (
        <div className={styles.headerContainer}>
            {dexTokensHeaderItems
                .filter((item): item is HeaderItem => item !== null)
                .map((item: HeaderItem) => {
                    const isActiveSort: boolean =
                        sortedTokens.sortBy.slug === item.slug;
                    return (
                        <div
                            key={JSON.stringify(item.label)} // No need for optional chaining
                            className={`${styles.gridHeaderItem} ${item.classname} ${styles.headerItems}`}
                            style={{
                                cursor: item.sortable ? 'pointer' : 'default',
                                paddingRight:
                                    item?.tooltipText && desktopView
                                        ? '16px'
                                        : '0',
                            }}
                            onClick={() =>
                                item.sortable && sortedTokens.update(item.slug)
                            }
                        >
                            {item.label}
                            {isActiveSort && (
                                <AssignSort
                                    direction={
                                        sortedTokens.sortBy.reverse
                                            ? 'descending'
                                            : 'ascending'
                                    }
                                />
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

    const noResults = (
        <div className={styles.no_results}>
            No pools match the search query: {searchQuery}
            <button onClick={() => setSearchQuery('')}>View all Tokens</button>
        </div>
    );

    const tempItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const skeletonDisplay = tempItems.map((item, idx) => (
        <TokenRowSkeleton key={idx} />
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

                {sortedTokens.data.length
                    ? sortedTokens.data.map((token: dexTokenData) => {
                          const matchingPool: SinglePoolDataIF | undefined = (
                              allPoolStats || []
                          ).find(
                              (p: SinglePoolDataIF) =>
                                  (p.base.toLowerCase() ===
                                      token.tokenAddr.toLowerCase() &&
                                      !isWrappedNativeToken(p.quote)) ||
                                  (p.quote.toLowerCase() ===
                                      token.tokenAddr.toLowerCase() &&
                                      !isWrappedNativeToken(p.base)),
                          );

                          if (!token.tokenMeta || !matchingPool) return null;

                          return (
                              <TokenRow
                                  key={token.tokenAddr}
                                  token={token}
                                  tokenMeta={token.tokenMeta}
                                  matchingPool={matchingPool}
                                  goToMarket={goToMarket}
                              />
                          );
                      })
                    : searchQuery
                      ? noResults
                      : skeletonDisplay}
            </div>
        </div>
    );
}

export default memo(DexTokens);
