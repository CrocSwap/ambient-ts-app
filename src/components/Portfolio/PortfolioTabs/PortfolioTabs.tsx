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
import {
    PositionUpdateFn,
    getPositionData,
} from '../../../App/functions/getPositionData';
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
import {
    resetLookupUserDataLoadingStatus,
    setDataLoadingStatus,
} from '../../../utils/state/graphDataSlice';
import { getLimitOrderData } from '../../../App/functions/getLimitOrderData';
import { TokenPriceFn } from '../../../App/functions/fetchTokenPrice';
import { fetchUserRecentChanges } from '../../../App/functions/fetchUserRecentChanges';
import Orders from '../../Trade/TradeTabs/Orders/Orders';
import Ranges from '../../Trade/TradeTabs/Ranges/Ranges';
import Transactions from '../../Trade/TradeTabs/Transactions/Transactions';
import { SpotPriceFn } from '../../../App/functions/querySpotPrice';
import { GRAPHCACHE_URL, IS_LOCAL_ENV } from '../../../constants';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { tokenMethodsIF } from '../../../App/hooks/useTokens';

// interface for React functional component props
interface propsIF {
    cachedFetchTokenPrice: TokenPriceFn;
    cachedPositionUpdateQuery: PositionUpdateFn;
    connectedUserTokens: (TokenIF | undefined)[];
    resolvedAddressTokens: (TokenIF | undefined)[];
    resolvedAddress: string;
    connectedAccountActive: boolean;
    openTokenModal: () => void;
    fullLayoutToggle: JSX.Element;
    cachedQuerySpotPrice: SpotPriceFn;
    tokens: tokenMethodsIF;
}

// React functional component
export default function PortfolioTabs(props: propsIF) {
    const {
        cachedQuerySpotPrice,
        cachedPositionUpdateQuery,
        cachedFetchTokenPrice,
        connectedUserTokens,
        resolvedAddressTokens,
        resolvedAddress,
        connectedAccountActive,
        openTokenModal,
        tokens,
    } = props;

    const dispatch = useAppDispatch();
    const {
        crocEnv,
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);

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
    const httpGraphCacheServerDomain = GRAPHCACHE_URL;

    const userPositionsCacheEndpoint =
        httpGraphCacheServerDomain + '/user_positions?';
    const userLimitOrdersCacheEndpoint =
        httpGraphCacheServerDomain + '/user_limit_order_states?';

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
                        userPositions.map((position: PositionIF) => {
                            return getPositionData(
                                position,
                                tokens.tokenUniv,
                                crocEnv,
                                chainId,
                                lastBlockNumber,
                            );
                        }),
                    ).then((updatedPositions) => {
                        setLookupAccountPositionData(updatedPositions);
                    });
                }
                IS_LOCAL_ENV && console.debug('dispatch');
                dispatch(
                    setDataLoadingStatus({
                        datasetName: 'lookupUserRangeData',
                        loadingStatus: false,
                    }),
                );
            })
            .catch(() => {
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
                if (userLimitOrderStates) {
                    Promise.all(
                        userLimitOrderStates.map((limitOrder: LimitOrderIF) => {
                            return getLimitOrderData(
                                limitOrder,
                                tokens.tokenUniv,
                            );
                        }),
                    ).then((updatedLimitOrderStates) => {
                        setLookupAccountLimitOrderData(updatedLimitOrderStates);
                    });
                }
                dispatch(
                    setDataLoadingStatus({
                        datasetName: 'lookupUserOrderData',
                        loadingStatus: false,
                    }),
                );
            })
            .catch(() => {
                dispatch(
                    setDataLoadingStatus({
                        datasetName: 'lookupUserOrderData',
                        loadingStatus: false,
                    }),
                );
            });

    const getLookupUserTransactions = async (accountToSearch: string) =>
        fetchUserRecentChanges({
            tokenList: tokens.tokenUniv,
            user: accountToSearch,
            chainId: chainId,
            annotate: true,
            addValue: true,
            simpleCalc: true,
            annotateMEV: false,
            ensResolution: true,
            n: 100, // fetch last 500 changes,
        })
            .then((updatedTransactions) => {
                if (updatedTransactions) {
                    setLookupAccountTransactionData(updatedTransactions);
                }

                dispatch(
                    setDataLoadingStatus({
                        datasetName: 'lookupUserTxData',
                        loadingStatus: false,
                    }),
                );
            })
            .catch(() => {
                dispatch(
                    setDataLoadingStatus({
                        datasetName: 'lookupUserTxData',
                        loadingStatus: false,
                    }),
                );
            });

    useEffect(() => {
        (async () => {
            IS_LOCAL_ENV &&
                console.debug(
                    'querying user tx/order/positions because address changed',
                );
            if (!connectedAccountActive) {
                if (resolvedAddress) {
                    dispatch(resetLookupUserDataLoadingStatus());
                    await getLookupUserTransactions(resolvedAddress);
                    await getLookupUserLimitOrders(resolvedAddress);
                    await getLookupUserPositions(resolvedAddress);
                } else {
                    dispatch(
                        setDataLoadingStatus({
                            datasetName: 'lookupUserTxData',
                            loadingStatus: false,
                        }),
                    );
                    dispatch(
                        setDataLoadingStatus({
                            datasetName: 'lookupUserOrderData',
                            loadingStatus: false,
                        }),
                    );
                    dispatch(
                        setDataLoadingStatus({
                            datasetName: 'lookupUserRangeData',
                            loadingStatus: false,
                        }),
                    );
                }
            }
        })();
    }, [resolvedAddress, connectedAccountActive, tokens.tokenUniv]);

    const activeAccountPositionData = connectedAccountActive
        ? connectedAccountPositionData
        : lookupAccountPositionData;
    // eslint-disable-next-line
    const activeAccountLimitOrderData = connectedAccountActive
        ? connectedAccountLimitOrderData
        : lookupAccountLimitOrderData;

    const activeAccountTransactionData = connectedAccountActive
        ? connectedAccountTransactionData?.filter((tx) => {
              if (tx.changeType !== 'fill') {
                  return true;
              } else {
                  return false;
              }
          })
        : lookupAccountTransactionData?.filter((tx) => {
              if (tx.changeType !== 'fill') {
                  return true;
              } else {
                  return false;
              }
          });

    // props for <Wallet/> React Element
    const walletProps = {
        cachedFetchTokenPrice: cachedFetchTokenPrice,
        connectedUserTokens: connectedUserTokens,
        resolvedAddressTokens: resolvedAddressTokens,
        connectedAccountActive: connectedAccountActive,
        resolvedAddress: resolvedAddress,
        tokens: tokens,
    };

    // props for <Exchange/> React Element
    const exchangeProps = {
        cachedFetchTokenPrice: cachedFetchTokenPrice,
        connectedUserTokens: connectedUserTokens,
        resolvedAddressTokens: resolvedAddressTokens,
        connectedAccountActive: connectedAccountActive,
        resolvedAddress: resolvedAddress,
        openTokenModal: openTokenModal,
        tokens: tokens,
    };

    // props for <Range/> React Element
    const rangeProps = {
        cachedQuerySpotPrice: cachedQuerySpotPrice,
        cachedPositionUpdateQuery: cachedPositionUpdateQuery,
        activeAccountPositionData: activeAccountPositionData,
        connectedAccountActive: connectedAccountActive,
        isAccountView: true,
    };

    // props for <Transactions/> React Element
    const transactionsProps = {
        activeAccountTransactionData: activeAccountTransactionData,
        connectedAccountActive: connectedAccountActive,
        changesInSelectedCandle: undefined,
        isCandleSelected: false,
        isAccountView: true,
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
