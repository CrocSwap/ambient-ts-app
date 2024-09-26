import { useContext, useEffect, useRef, useState } from 'react';
import { ExploreContext } from '../../../contexts/ExploreContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { PoolContext } from '../../../contexts/PoolContext';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { linkGenMethodsIF, useLinkGen } from '../../../utils/hooks/useLinkGen';
import { AiOutlineDollarCircle } from 'react-icons/ai';
import { DefaultTooltip } from '../../../components/Global/StyledTooltip/StyledTooltip';
import { PoolIF } from '../../../ambient-utils/types';
import styles from './Explore.module.css';
import { LuRefreshCcw, LuSearch } from 'react-icons/lu';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import TopPools from '../../../components/Global/Explore/TopPools/TopPools';
import DexTokens from '../../../components/Global/Explore/DexTokens/DexTokens';

interface ExploreIF {
    view: 'pools' | 'tokens';
}

export default function Explore(props: ExploreIF) {
    const { view } = props;
    // full expanded data set
    const {
        pools,
        tokens,
        isExploreDollarizationEnabled,
        setIsExploreDollarizationEnabled,
    } = useContext(ExploreContext);
    const { crocEnv, chainData } = useContext(CrocEnvContext);
    const { poolList } = useContext(PoolContext);
    const {
        isActiveNetworkBlast,
        isActiveNetworkScroll,
        isActiveNetworkMainnet,
    } = useContext(ChainDataContext);

    const getLimitedPools = async (): Promise<void> => {
        if (crocEnv && poolList.length) {
            pools.getLimited(poolList, crocEnv, chainData.chainId);
        }
    };

    // trigger process to fetch and format token data when page loads with
    // ... gatekeeping to prevent re-fetch if data is already loaded
    useEffect(() => {
        if (crocEnv !== undefined && tokens.data.length === 0) {
            tokens.update();
        }
    }, [crocEnv !== undefined]);

    const getAllPools = async (): Promise<void> => {
        // make sure crocEnv exists and pool metadata is present
        if (crocEnv && poolList.length) {
            // clear text in DOM for time since last update
            pools.reset();
            // use metadata to get expanded pool data
            getLimitedPools().then(() => {
                pools.getExtra(poolList, crocEnv, chainData.chainId);
            });
        }
    };

    // get expanded pool metadata, if not already fetched
    useEffect(() => {
        if (crocEnv !== undefined && poolList.length === 0) {
            getAllPools();
        }
    }, [crocEnv, poolList.length]);

    // logic to handle onClick navigation action
    const linkGenMarket: linkGenMethodsIF = useLinkGen('market');
    function goToMarket(tknA: string, tknB: string): void {
        linkGenMarket.navigate({
            chain: chainData.chainId,
            tokenA: tknA,
            tokenB: tknB,
        });
    }

    const titleTextPools: string = isActiveNetworkMainnet
        ? 'Top Ambient Pools on Ethereum'
        : isActiveNetworkBlast
          ? 'Top Ambient Pools on Blast'
          : isActiveNetworkScroll
            ? 'Top Ambient Pools on Scroll'
            : 'Top Pools on Ambient';

    const titleTextTokens: string = isActiveNetworkMainnet
        ? 'Active Tokens on Ethereum'
        : isActiveNetworkBlast
          ? 'Active Tokens on Blast'
          : isActiveNetworkScroll
            ? 'Active Tokens on Scroll'
            : 'Top Pools on Ambient';

    const titleTextForDOM: string =
        view === 'pools' ? titleTextPools : titleTextTokens;

    // logic router to dispatch the correct action for a refresh button click
    function handleRefresh(): void {
        switch (view) {
            case 'pools':
                getAllPools();
                break;
            case 'tokens':
                tokens.update();
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
            ? tokens.data.filter((token) => {
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
            : tokens.data;

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
        <div className={`${styles.options_content} ${view === 'tokens' ? styles.pools_options_content: ''}`}>
        {inputContainer}
        {view === 'pools' && (
            <DefaultTooltip
                interactive
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
            interactive
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
    )

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
                    chainId={chainData.chainId}
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