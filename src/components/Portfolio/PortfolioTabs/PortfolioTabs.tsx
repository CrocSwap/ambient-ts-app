import {
    // START: Import React and Dongles
    useEffect,
    useState,
    useContext,
} from 'react';
// START: Import JSX Functional Components
import Wallet from '../../Global/Account/AccountTabs/Wallet/Wallet';
import Exchange from '../../Global/Account/AccountTabs/Exchange/Exchange';
import TabComponent from '../../Global/TabComponent/TabComponent';
// import Tokens from '../Tokens/Tokens';

// START: Import Local Files
import {
    getPositionData,
    getLimitOrderData,
} from '../../../ambient-utils/dataLayer';
import {
    LimitOrderIF,
    PositionIF,
    TokenIF,
    TransactionIF,
    PositionServerIF,
    LimitOrderServerIF,
} from '../../../ambient-utils/types';
import openOrdersImage from '../../../assets/images/sidebarImages/openOrders.svg';
import rangePositionsImage from '../../../assets/images/sidebarImages/rangePositions.svg';
import recentTransactionsImage from '../../../assets/images/sidebarImages/recentTransactions.svg';
import walletImage from '../../../assets/images/sidebarImages/wallet.svg';
import exchangeImage from '../../../assets/images/sidebarImages/exchange.svg';
import { fetchUserRecentChanges } from '../../../ambient-utils/api';
import Orders from '../../Trade/TradeTabs/Orders/Orders';
import Ranges from '../../Trade/TradeTabs/Ranges/Ranges';
import Transactions from '../../Trade/TradeTabs/Transactions/Transactions';
import {
    CACHE_UPDATE_FREQ_IN_MS,
    GCGO_OVERRIDE_URL,
    IS_LOCAL_ENV,
} from '../../../ambient-utils/constants';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { TokenContext } from '../../../contexts/TokenContext';
import { CachedDataContext } from '../../../contexts/CachedDataContext';
import { PortfolioTabsPortfolioTabsContainer } from '../../../styled/Components/Portfolio';
import { GraphDataContext } from '../../../contexts/GraphDataContext';
import { DataLoadingContext } from '../../../contexts/DataLoadingContext';
import Points from '../../Global/Account/AccountTabs/Points/Points';
import {
    BlastUserXpDataIF,
    UserXpDataIF,
} from '../../../contexts/UserDataContext';
import medal from '../../../assets/images/icons/medal.svg';
import { AppStateContext } from '../../../contexts/AppStateContext';

// interface for React functional component props
interface propsIF {
    resolvedAddressTokens: (TokenIF | undefined)[];
    resolvedAddress: string | undefined;
    connectedAccountActive: boolean;
    fullLayoutActive: boolean;
    resolvedUserXp: UserXpDataIF;
    resolvedUserBlastXp: BlastUserXpDataIF;
}

// React functional component
export default function PortfolioTabs(props: propsIF) {
    const {
        resolvedAddressTokens,
        resolvedAddress,
        connectedAccountActive,
        fullLayoutActive,
        resolvedUserXp,
        resolvedUserBlastXp,
    } = props;

    const {
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext(CachedDataContext);

    const {
        server: { isEnabled: isServerEnabled },
        isUserIdle,
    } = useContext(AppStateContext);

    const { setDataLoadingStatus } = useContext(DataLoadingContext);
    const {
        crocEnv,
        activeNetwork,
        provider,
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { tokens } = useContext(TokenContext);
    const { positionsByUser, limitOrdersByUser, transactionsByUser } =
        useContext(GraphDataContext);

    // TODO: can pull into GraphDataContext
    const filterFn = <T extends { chainId: string }>(x: T) =>
        x.chainId === chainId;

    const _positionsByUser = positionsByUser.positions.filter(filterFn);
    const _txsByUser = transactionsByUser.changes.filter(filterFn);
    const _limitsByUser = limitOrdersByUser.limitOrders.filter(filterFn);

    const [lookupAccountPositionData, setLookupAccountPositionData] = useState<
        PositionIF[]
    >([]);
    const [lookupAccountLimitOrderData, setLookupAccountLimitOrderData] =
        useState<LimitOrderIF[]>([]);
    const [lookupAccountTransactionData, setLookupAccountTransactionData] =
        useState<TransactionIF[]>([]);

    const userPositionsCacheEndpoint = GCGO_OVERRIDE_URL
        ? GCGO_OVERRIDE_URL + '/user_positions?'
        : activeNetwork.graphCacheUrl + '/user_positions?';
    const userLimitOrdersCacheEndpoint = GCGO_OVERRIDE_URL
        ? GCGO_OVERRIDE_URL + '/user_limit_orders?'
        : activeNetwork.graphCacheUrl + '/user_limit_orders?';

    const getLookupUserPositions = async (accountToSearch: string) =>
        fetch(
            userPositionsCacheEndpoint +
                new URLSearchParams({
                    user: accountToSearch,
                    chainId: chainId,
                    ensResolution: 'true',
                    annotate: 'true',
                    omitEmpty: 'true',
                    omitKnockout: 'true',
                    addValue: 'true',
                }),
        )
            .then((response) => response?.json())
            .then((json) => {
                const userPositions = json?.data;
                // temporarily skip ENS fetch
                const skipENSFetch = true;
                if (userPositions && crocEnv && provider) {
                    Promise.all(
                        userPositions.map((position: PositionServerIF) => {
                            return getPositionData(
                                position,
                                tokens.tokenUniv,
                                crocEnv,
                                provider,
                                chainId,
                                cachedFetchTokenPrice,
                                cachedQuerySpotPrice,
                                cachedTokenDetails,
                                cachedEnsResolve,
                                skipENSFetch,
                            );
                        }),
                    )
                        .then((updatedPositions) => {
                            setLookupAccountPositionData(
                                updatedPositions.filter(
                                    (p) => p.positionLiq > 0,
                                ),
                            );
                        })
                        .finally(() => {
                            setDataLoadingStatus({
                                datasetName: 'isLookupUserRangeDataLoading',
                                loadingStatus: false,
                            });
                        });
                }
            });
    const getLookupUserLimitOrders = async (accountToSearch: string) =>
        fetch(
            userLimitOrdersCacheEndpoint +
                new URLSearchParams({
                    user: accountToSearch,
                    chainId: chainId,
                    ensResolution: 'true',
                    omitEmpty: 'true',
                }),
        )
            .then((response) => response?.json())
            .then((json) => {
                // temporarily skip ENS fetch
                const skipENSFetch = true;
                const userLimitOrderStates = json?.data;
                if (userLimitOrderStates && crocEnv && provider) {
                    Promise.all(
                        userLimitOrderStates.map(
                            (limitOrder: LimitOrderServerIF) => {
                                return getLimitOrderData(
                                    limitOrder,
                                    tokens.tokenUniv,
                                    crocEnv,
                                    provider,
                                    chainId,
                                    cachedFetchTokenPrice,
                                    cachedQuerySpotPrice,
                                    cachedTokenDetails,
                                    cachedEnsResolve,
                                    skipENSFetch,
                                );
                            },
                        ),
                    )
                        .then((updatedLimitOrderStates) => {
                            setLookupAccountLimitOrderData(
                                updatedLimitOrderStates,
                            );
                        })
                        .finally(() => {
                            setDataLoadingStatus({
                                datasetName: 'isLookupUserOrderDataLoading',
                                loadingStatus: false,
                            });
                        });
                }
            });
    const getLookupUserTransactions = async (accountToSearch: string) => {
        if (crocEnv && provider) {
            fetchUserRecentChanges({
                tokenList: tokens.tokenUniv,
                user: accountToSearch,
                chainId: chainId,
                annotate: true,
                addValue: true,
                simpleCalc: true,
                annotateMEV: false,
                ensResolution: true,
                n: 200, // fetch last 200 changes,
                crocEnv: crocEnv,
                graphCacheUrl: activeNetwork.graphCacheUrl,
                provider,
                cachedFetchTokenPrice: cachedFetchTokenPrice,
                cachedQuerySpotPrice: cachedQuerySpotPrice,
                cachedTokenDetails: cachedTokenDetails,
                cachedEnsResolve: cachedEnsResolve,
            })
                .then((updatedTransactions) => {
                    if (updatedTransactions) {
                        setLookupAccountTransactionData(updatedTransactions);
                    }
                })
                .finally(() => {
                    setDataLoadingStatus({
                        datasetName: 'isLookupUserTxDataLoading',
                        loadingStatus: false,
                    });
                });
        }
    };

    useEffect(() => {
        (async () => {
            if (
                isServerEnabled &&
                !connectedAccountActive &&
                !!tokens.tokenUniv &&
                resolvedAddress &&
                !!crocEnv
            ) {
                IS_LOCAL_ENV &&
                    console.debug(
                        'querying user tx/order/positions because address changed',
                    );

                await Promise.all([
                    getLookupUserTransactions(resolvedAddress),
                    getLookupUserLimitOrders(resolvedAddress),
                    getLookupUserPositions(resolvedAddress),
                ]);
            }
        })();
    }, [
        resolvedAddress,
        connectedAccountActive,
        isUserIdle
            ? Math.floor(Date.now() / (2 * CACHE_UPDATE_FREQ_IN_MS))
            : Math.floor(Date.now() / CACHE_UPDATE_FREQ_IN_MS),
        !!tokens.tokenUniv,
        !!crocEnv,
        !!provider,

        isServerEnabled,
    ]);

    const activeAccountPositionData = connectedAccountActive
        ? _positionsByUser
        : lookupAccountPositionData;
    // eslint-disable-next-line
    const activeAccountLimitOrderData = connectedAccountActive
        ? _limitsByUser
        : lookupAccountLimitOrderData;

    const activeAccountTransactionData = connectedAccountActive
        ? _txsByUser?.filter((tx) => {
              if (tx.changeType !== 'fill' && tx.changeType !== 'cross') {
                  return true;
              } else {
                  return false;
              }
          })
        : lookupAccountTransactionData?.filter((tx) => {
              if (tx.changeType !== 'fill' && tx.changeType !== 'cross') {
                  return true;
              } else {
                  return false;
              }
          });

    // props for <Wallet/> React Element
    const walletProps = {
        chainId: chainId,
        resolvedAddressTokens: resolvedAddressTokens,
        connectedAccountActive: connectedAccountActive,
        resolvedAddress: resolvedAddress ?? '',
        cachedFetchTokenPrice: cachedFetchTokenPrice,
    };

    // props for <Exchange/> React Element
    const exchangeProps = {
        chainId: chainId,
        resolvedAddressTokens: resolvedAddressTokens,
        connectedAccountActive: connectedAccountActive,
        resolvedAddress: resolvedAddress ?? '',
        cachedFetchTokenPrice: cachedFetchTokenPrice,
    };

    // props for <Range/> React Element
    const rangeProps = {
        activeAccountPositionData: activeAccountPositionData,
        connectedAccountActive: connectedAccountActive,
        isAccountView: true,
    };

    // props for <Points/> React Element
    const pointsProps = {
        resolvedUserXp: resolvedUserXp,
        resolvedUserBlastXp: resolvedUserBlastXp,
        connectedAccountActive: connectedAccountActive,
    };

    // props for <Transactions/> React Element
    const transactionsProps = {
        activeAccountTransactionData: activeAccountTransactionData,
        connectedAccountActive: connectedAccountActive,
        changesInSelectedCandle: undefined,
        isAccountView: true,
        fullLayoutActive: fullLayoutActive,
    };

    // Props for <Orders/> React Element
    const ordersProps = {
        activeAccountLimitOrderData: activeAccountLimitOrderData,
        connectedAccountActive: connectedAccountActive,
        isAccountView: true,
    };

    const accountTabDataWithTokens = [
        {
            label: 'Transactions',
            content: <Transactions {...transactionsProps} />,
            icon: recentTransactionsImage,
        },
        {
            label: 'Limits',
            content: <Orders {...ordersProps} />,
            icon: openOrdersImage,
        },
        {
            label: 'Liquidity',
            content: <Ranges {...rangeProps} />,
            icon: rangePositionsImage,
        },
        {
            label: 'Points',
            content: <Points {...pointsProps} />,
            icon: medal,
        },
        {
            label: 'Exchange Balances',
            content: <Exchange {...exchangeProps} />,
            icon: exchangeImage,
        },
        {
            label: 'Wallet Balances',
            content: <Wallet {...walletProps} />,
            icon: walletImage,
        },
    ];

    const accountTabDataWithoutTokens = [
        {
            label: 'Transactions',
            content: <Transactions {...transactionsProps} />,
            icon: recentTransactionsImage,
        },
        {
            label: 'Limits',
            content: <Orders {...ordersProps} />,
            icon: openOrdersImage,
        },
        {
            label: 'Liquidity',
            content: <Ranges {...rangeProps} />,
            icon: rangePositionsImage,
        },
        {
            label: 'Points',
            content: <Points {...pointsProps} />,
            icon: medal,
        },
        {
            label: 'Exchange Balances',
            content: <Exchange {...exchangeProps} />,
            icon: exchangeImage,
        },
        {
            label: 'Wallet Balances',
            content: <Wallet {...walletProps} />,
            icon: walletImage,
        },
    ];

    return (
        <PortfolioTabsPortfolioTabsContainer>
            <TabComponent
                data={
                    connectedAccountActive
                        ? accountTabDataWithTokens
                        : accountTabDataWithoutTokens
                }
                rightTabOptions={false}
            />
        </PortfolioTabsPortfolioTabsContainer>
    );
}
