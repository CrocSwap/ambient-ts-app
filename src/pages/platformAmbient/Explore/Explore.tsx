import { useContext, useEffect, useRef, useState } from 'react';
import { AiOutlineDollarCircle } from 'react-icons/ai';
import { LuRefreshCcw, LuSearch } from 'react-icons/lu';
import { hiddenTokens } from '../../../ambient-utils/constants';
import { PoolIF } from '../../../ambient-utils/types';
import DexTokens from '../../../components/Global/Explore/DexTokens/DexTokens';
import TopPools from '../../../components/Global/Explore/TopPools/TopPools';
import { DefaultTooltip } from '../../../components/Global/StyledTooltip/StyledTooltip';
import { AppStateContext } from '../../../contexts';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { ExploreContext } from '../../../contexts/ExploreContext';
import { PoolContext } from '../../../contexts/PoolContext';
import { linkGenMethodsIF, useLinkGen } from '../../../utils/hooks/useLinkGen';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import styles from './Explore.module.css';

interface ExploreIF {
    view: 'pools' | 'tokens';
}

export default function Explore(props: ExploreIF) {
    const { view } = props;
    // full expanded data set
    const {
        pools,
        topTokensOnchain,
        isExploreDollarizationEnabled,
        setIsExploreDollarizationEnabled,
    } = useContext(ExploreContext);
    const { crocEnv } = useContext(CrocEnvContext);

    const {
        activeNetwork: { chainId, displayName },
    } = useContext(AppStateContext);
    const { poolList } = useContext(PoolContext);

    // trigger process to fetch and format token data when page loads with
    // ... gatekeeping to prevent re-fetch if data is already loaded
    useEffect(() => {
        if (crocEnv !== undefined && topTokensOnchain.data.length === 0) {
            topTokensOnchain.update();
        }
    }, [crocEnv !== undefined]);

    const refreshPools = async () => {
        // make sure crocEnv exists and pool metadata is present
        if (crocEnv && poolList.length) {
            // clear text in DOM for time since last update
            pools.reset();
            // pause for a moment to allow loading indicator to appear
            await new Promise((resolve) => setTimeout(resolve, 300));
            // use metadata to get expanded pool data
            await pools.processPoolListForActiveChain();
        }
    };

    // logic to handle onClick navigation action
    const linkGenMarket: linkGenMethodsIF = useLinkGen('market');
    function goToMarket(tknA: string, tknB: string): void {
        linkGenMarket.navigate({
            chain: chainId,
            tokenA: tknA,
            tokenB: tknB,
        });
    }

    const titleTextPools = `Top Ambient Pools on ${displayName}`;

    const titleTextTokens = `Active Tokens on ${displayName}`;

    const titleTextForDOM: string =
        view === 'pools' ? titleTextPools : titleTextTokens;

    // logic router to dispatch the correct action for a refresh button click
    function handleRefresh(): void {
        switch (view) {
            case 'pools':
                refreshPools();
                break;
            case 'tokens':
                topTokensOnchain.update();
                break;
        }
    }

    const linkGenExplorePools: linkGenMethodsIF = useLinkGen('explorePools');
    const linkGenExploreTokens: linkGenMethodsIF = useLinkGen('exploreTokens');
    function changeView(current: 'pools' | 'tokens') {
        if (current === 'pools') {
            linkGenExploreTokens.navigate();
        } else if (current === 'tokens') {
            linkGenExplorePools.navigate();
        }
    }

    const [searchQueryPool, setSearchQueryPool] = useState<string>('');
    const [searchQueryToken, setSearchQueryToken] = useState<string>('');

    const filteredPools =
        searchQueryPool.length >= 2
            ? pools.all.filter((pool: PoolIF) => {
                  const lowerCaseQuery = searchQueryPool.toLowerCase();
                  return (
                      pool.base.name.toLowerCase().includes(lowerCaseQuery) ||
                      pool.base.symbol.toLowerCase().includes(lowerCaseQuery) ||
                      pool.quote.name.toLowerCase().includes(lowerCaseQuery) ||
                      pool.quote.symbol.toLowerCase().includes(lowerCaseQuery)
                  );
              })
            : pools.all;

    const filteredTokens =
        searchQueryToken.length >= 2
            ? topTokensOnchain.data
                  .filter((token) => {
                      const lowerCaseQuery = searchQueryToken.toLowerCase();
                      return (
                          token.tokenMeta?.name
                              .toLowerCase()
                              .includes(lowerCaseQuery) ||
                          token.tokenMeta?.symbol
                              .toLowerCase()
                              .includes(lowerCaseQuery)
                      );
                  })
                  .filter((t) => {
                      // check if token is in hidden token list
                      return !hiddenTokens.some(
                          (excluded) =>
                              excluded.address.toLowerCase() ===
                                  t.tokenAddr.toLowerCase() &&
                              excluded.chainId === t.tokenMeta?.chainId,
                      );
                  })
            : topTokensOnchain.data.filter((t) => {
                  // check if token is in exclusion list
                  return !hiddenTokens.some(
                      (excluded) =>
                          excluded.address.toLowerCase() ===
                              t.tokenAddr.toLowerCase() &&
                          excluded.chainId === t.tokenMeta?.chainId,
                  );
              });

    const searchInputRef = useRef<HTMLDivElement>(null);

    const clickOutsideInputHandler = () => {
        const searchQuery =
            view === 'pools' ? searchQueryPool : searchQueryToken;
        const filteredItems = view === 'pools' ? filteredPools : filteredTokens;
        const setSearchQuery =
            view === 'pools' ? setSearchQueryPool : setSearchQueryToken;

        if (!searchQuery || filteredItems.length) {
            return null;
        }

        setSearchQuery('');
    };

    useOnClickOutside(searchInputRef, clickOutsideInputHandler);

    const inputContainer = (
        <div className={styles.input_container} ref={searchInputRef}>
            <div className={styles.input_wrapper}>
                <LuSearch />
                <input
                    type='text'
                    placeholder={`Search ${view === 'pools' ? 'pools' : 'tokens'} by name or symbol`}
                    value={
                        view === 'pools' ? searchQueryPool : searchQueryToken
                    }
                    onChange={
                        view === 'pools'
                            ? (e) => setSearchQueryPool(e.target.value)
                            : (e) => setSearchQueryToken(e.target.value)
                    }
                    className={styles.input}
                />
            </div>
        </div>
    );

    const optionsContent = (
        <div
            className={`${styles.options_content} ${view === 'tokens' ? styles.pools_options_content : ''}`}
        >
            {inputContainer}
            {view === 'pools' && (
                <DefaultTooltip
                    title={
                        isExploreDollarizationEnabled
                            ? 'Switch to prices in native currency'
                            : 'Switch to prices in USD'
                    }
                    enterDelay={500}
                >
                    <div className={styles.refresh_container}>
                        <button
                            className={styles.refresh_button}
                            onClick={() =>
                                setIsExploreDollarizationEnabled(
                                    (prev) => !prev,
                                )
                            }
                        >
                            {
                                <AiOutlineDollarCircle
                                    size={20}
                                    id='trade_dollarized_prices_button'
                                    aria-label='Toggle dollarized prices button'
                                    style={{
                                        color: isExploreDollarizationEnabled
                                            ? 'var(--accent1)'
                                            : undefined,
                                    }}
                                />
                            }
                        </button>
                    </div>
                </DefaultTooltip>
            )}
            <DefaultTooltip
                title={
                    view === 'pools'
                        ? 'Refresh Top Pools'
                        : 'Refresh Active Tokens'
                }
                enterDelay={500}
            >
                <div className={styles.refresh_container}>
                    <button
                        className={styles.refresh_button}
                        onClick={() => handleRefresh()}
                    >
                        <LuRefreshCcw size={20} />
                    </button>
                </div>
            </DefaultTooltip>
        </div>
    );

    function handleToggle() {
        changeView(view);
        setSearchQueryToken('');
        setSearchQueryPool('');
    }

    return (
        <section className={styles.main_container}>
            {/* <div className={styles.main_wrapper}>
            <h2 className={styles.title_text}>{titleTextForDOM}</h2>
            </div> */}
            <div className={styles.options_wrapper}>
                <h2 className={styles.title_text}>{titleTextForDOM}</h2>
                {optionsContent}
            </div>

            {view === 'pools' && (
                <TopPools
                    allPools={filteredPools}
                    goToMarket={goToMarket}
                    isExploreDollarizationEnabled={
                        isExploreDollarizationEnabled
                    }
                    searchQuery={searchQueryPool}
                    setSearchQuery={setSearchQueryPool}
                    view={view}
                    handleToggle={handleToggle}
                />
            )}
            {view === 'tokens' && (
                <DexTokens
                    dexTokens={filteredTokens}
                    chainId={chainId}
                    goToMarket={goToMarket}
                    searchQuery={searchQueryToken}
                    setSearchQuery={setSearchQueryToken}
                    view={view}
                    handleToggle={handleToggle}
                />
            )}
        </section>
    );
}
