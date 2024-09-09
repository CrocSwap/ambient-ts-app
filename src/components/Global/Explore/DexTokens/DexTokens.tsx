import { Dispatch, memo, SetStateAction, useContext } from 'react';
import Spinner from '../../Spinner/Spinner';
import styles from './DexTokens.module.css';
import { useSortedDexTokens, sortedDexTokensIF } from '../useSortedDexTokens';
import { getDefaultPairForChain } from '../../../../ambient-utils/constants';
import {
    GCServerPoolIF,
    PoolIF,
    TokenIF,
} from '../../../../ambient-utils/types';
import { PoolContext } from '../../../../contexts/PoolContext';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import { usePoolList2 } from '../../../../App/hooks/usePoolList2';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { isWrappedNativeToken } from '../../../../ambient-utils/dataLayer';
import AssignSort from '../AssignSort';
import TooltipComponent from '../../TooltipComponent/TooltipComponent';
import { dexTokenData } from '../../../../pages/platformAmbient/Explore/useTokenStats';
import ExploreToggle from '../ExploreToggle/ExploreToggle';
import TokenRow from '../TokenRow/TokenRow';

export type columnSlugs =
    | 'token'
    | 'name'
    | 'tvl'
    | 'fees'
    | 'volume'
    | 'tradeBtn';

export interface HeaderItem {
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
        chainId,
        goToMarket,
        searchQuery,
        setSearchQuery,
        view,
        handleToggle,
    } = props;

    const { findPool } = useContext(PoolContext);

    const defaultTokensForChain: [TokenIF, TokenIF] =
        getDefaultPairForChain(chainId);

    const sortedTokens: sortedDexTokensIF = useSortedDexTokens(dexTokens);

    const desktopView = useMediaQuery('(min-width: 768px)');
    // this logic is here to patch cases where existing logic to identify a token pool fails,
    // ... this is not an optimal location but works as a stopgap that minimizes needing to
    // ... alter existing logic or type annotation in the component tree
    const { crocEnv, activeNetwork } = useContext(CrocEnvContext);
    const unfilteredPools: GCServerPoolIF[] = usePoolList2(
        activeNetwork.graphCacheUrl,
        crocEnv,
    );

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

    return (
        <div className={styles.mainContainer}>
            <ExploreToggle view={view} handleToggle={handleToggle} />

            {headerDisplay}
            <div className={`${styles.contentContainer} custom_scroll_ambient`}>
                <div className={styles.borderRight} />

                {sortedTokens.data.length ? (
                    sortedTokens.data.map((token: dexTokenData) => {
                        const samplePool: PoolIF | undefined =
                            findPool(
                                token.tokenAddr,
                                defaultTokensForChain[0],
                            ) ??
                            findPool(
                                token.tokenAddr,
                                defaultTokensForChain[1],
                            ) ??
                            findPool(token.tokenAddr);

                        const backupPool: GCServerPoolIF | undefined =
                            unfilteredPools.find(
                                (p: GCServerPoolIF) =>
                                    (p.base.toLowerCase() ===
                                        token.tokenAddr.toLowerCase() &&
                                        !isWrappedNativeToken(p.quote)) ||
                                    (p.quote.toLowerCase() ===
                                        token.tokenAddr.toLowerCase() &&
                                        !isWrappedNativeToken(p.base)),
                            );

                        if (!token.tokenMeta || (!samplePool && !backupPool))
                            return null;

                        return (
                            <TokenRow
                                key={token.tokenAddr}
                                token={token}
                                tokenMeta={token.tokenMeta}
                                samplePool={samplePool}
                                backupPool={backupPool}
                                goToMarket={goToMarket}
                            />
                        );
                    })
                ) : searchQuery ? (
                    noResults
                ) : (
                    <div className={styles.spinner_container}>
                        <Spinner size={100} bg='var(--dark1)' centered />
                    </div>
                )}
            </div>
        </div>
    );
}

export default memo(DexTokens);
