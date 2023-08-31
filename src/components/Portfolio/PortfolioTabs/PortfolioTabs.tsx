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
import styles from './PortfolioTabs.module.css';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../utils/hooks/reduxToolkit';
import { getPositionData } from '../../../App/functions/getPositionData';
import {
    LimitOrderIF,
    PositionIF,
    TokenIF,
    TransactionIF,
} from '../../../utils/interfaces/exports';
import openOrdersImage from '../../../assets/images/sidebarImages/openOrders.svg';
import rangePositionsImage from '../../../assets/images/sidebarImages/rangePositions.svg';
import recentTransactionsImage from '../../../assets/images/sidebarImages/recentTransactions.svg';
import walletImage from '../../../assets/images/sidebarImages/wallet.svg';
import exchangeImage from '../../../assets/images/sidebarImages/exchange.svg';
import { setDataLoadingStatus } from '../../../utils/state/graphDataSlice';
import { getLimitOrderData } from '../../../App/functions/getLimitOrderData';
import { fetchUserRecentChanges } from '../../../App/functions/fetchUserRecentChanges';
import Orders from '../../Trade/TradeTabs/Orders/Orders';
import Ranges from '../../Trade/TradeTabs/Ranges/Ranges';
import Transactions from '../../Trade/TradeTabs/Transactions/Transactions';
import { GRAPHCACHE_SMALL_URL, IS_LOCAL_ENV } from '../../../constants';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { PositionServerIF } from '../../../utils/interfaces/PositionIF';
import { LimitOrderServerIF } from '../../../utils/interfaces/LimitOrderIF';
import { TokenContext } from '../../../contexts/TokenContext';
import { CachedDataContext } from '../../../contexts/CachedDataContext';

// interface for React functional component props
interface propsIF {
    resolvedAddressTokens: (TokenIF | undefined)[];
    resolvedAddress: string | undefined;
    connectedAccountActive: boolean;
    fullLayoutActive: boolean;
}

// React functional component
export default function PortfolioTabs(props: propsIF) {
    const {
        resolvedAddressTokens,
        resolvedAddress,
        connectedAccountActive,
        fullLayoutActive,
    } = props;

    const dispatch = useAppDispatch();
    const {
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext(CachedDataContext);
    const {
        crocEnv,
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const { tokens } = useContext(TokenContext);

    const graphData = useAppSelector((state) => state?.graphData);
    const connectedAccountPositionData =
        graphData.positionsByUser.positions.filter(
            (position) => position.chainId === chainId,
        );
    const connectedAccountLimitOrderData =
        graphData.limitOrdersByUser.limitOrders.filter(
            (position) => position.chainId === chainId,
        );
    const connectedAccountTransactionData =
        graphData.changesByUser.changes.filter((x) => x.chainId === chainId);

    const [lookupAccountPositionData, setLookupAccountPositionData] = useState<
        PositionIF[]
    >([]);
    const [lookupAccountLimitOrderData, setLookupAccountLimitOrderData] =
        useState<LimitOrderIF[]>([]);
    const [lookupAccountTransactionData, setLookupAccountTransactionData] =
        useState<TransactionIF[]>([]);

    const userPositionsCacheEndpoint =
        GRAPHCACHE_SMALL_URL + '/user_positions?';
    const userLimitOrdersCacheEndpoint =
        GRAPHCACHE_SMALL_URL + '/user_limit_orders?';

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
                if (userPositions && crocEnv) {
                    Promise.all(
                        userPositions.map((position: PositionServerIF) => {
                            return getPositionData(
                                position,
                                tokens.tokenUniv,
                                crocEnv,
                                chainId,
                                lastBlockNumber,
                                cachedFetchTokenPrice,
                                cachedQuerySpotPrice,
                                cachedTokenDetails,
                                cachedEnsResolve,
                            );
                        }),
                    ).then((updatedPositions) => {
                        setLookupAccountPositionData(
                            updatedPositions.filter((p) => p.positionLiq > 0),
                        );
                    });
                }
                IS_LOCAL_ENV && console.debug('dispatch');
            })
            .finally(() => {
                dispatch(
                    setDataLoadingStatus({
                        datasetName: 'lookupUserRangeData',
                        loadingStatus: false,
                    }),
                );
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
                const userLimitOrderStates = json?.data;
                if (userLimitOrderStates && crocEnv) {
                    Promise.all(
                        userLimitOrderStates.map(
                            (limitOrder: LimitOrderServerIF) => {
                                return getLimitOrderData(
                                    limitOrder,
                                    tokens.tokenUniv,
                                    crocEnv,
                                    chainId,
                                    lastBlockNumber,
                                    cachedFetchTokenPrice,
                                    cachedQuerySpotPrice,
                                    cachedTokenDetails,
                                    cachedEnsResolve,
                                );
                            },
                        ),
                    ).then((updatedLimitOrderStates) => {
                        setLookupAccountLimitOrderData(updatedLimitOrderStates);
                    });
                }
            })
            .finally(() => {
                dispatch(
                    setDataLoadingStatus({
                        datasetName: 'lookupUserOrderData',
                        loadingStatus: false,
                    }),
                );
            });

    const getLookupUserTransactions = async (accountToSearch: string) => {
        if (crocEnv) {
            fetchUserRecentChanges({
                tokenList: tokens.tokenUniv,
                user: accountToSearch,
                chainId: chainId,
                annotate: true,
                addValue: true,
                simpleCalc: true,
                annotateMEV: false,
                ensResolution: true,
                n: 100, // fetch last 100 changes,
                crocEnv: crocEnv,
                lastBlockNumber: lastBlockNumber,
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
                    dispatch(
                        setDataLoadingStatus({
                            datasetName: 'lookupUserTxData',
                            loadingStatus: false,
                        }),
                    );
                });
        }
    };

    useEffect(() => {
        (async () => {
            if (
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
        lastBlockNumber,
        !!tokens.tokenUniv,
        !!crocEnv,
    ]);

    const activeAccountPositionData = connectedAccountActive
        ? connectedAccountPositionData
        : lookupAccountPositionData;
    // eslint-disable-next-line
    const activeAccountLimitOrderData = connectedAccountActive
        ? connectedAccountLimitOrderData
        : lookupAccountLimitOrderData;

    const activeAccountTransactionData = connectedAccountActive
        ? connectedAccountTransactionData?.filter((tx) => {
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
            label: 'Ranges',
            content: <Ranges {...rangeProps} />,
            icon: rangePositionsImage,
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
            label: 'Ranges',
            content: <Ranges {...rangeProps} />,
            icon: rangePositionsImage,
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
        <div className={styles.tabs_container}>
            <TabComponent
                data={
                    connectedAccountActive
                        ? accountTabDataWithTokens
                        : accountTabDataWithoutTokens
                }
                rightTabOptions={false}
            />
        </div>
    );
}
