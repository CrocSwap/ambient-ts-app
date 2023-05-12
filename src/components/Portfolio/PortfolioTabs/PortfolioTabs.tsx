import {
    // START: Import React and Dongles
    useEffect,
    useState,
    Dispatch,
    SetStateAction,
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
import { ChainSpec } from '@crocswap-libs/sdk';
import { ethers } from 'ethers';
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
import { diffHashSig } from '../../../utils/functions/diffHashSig';
import { GRAPHCACHE_URL, IS_LOCAL_ENV } from '../../../constants';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';

// interface for React functional component props
interface propsIF {
    isTokenABase: boolean;
    provider: ethers.providers.Provider | undefined;
    cachedFetchTokenPrice: TokenPriceFn;
    cachedPositionUpdateQuery: PositionUpdateFn;
    connectedUserTokens: (TokenIF | undefined)[];
    resolvedAddressTokens: (TokenIF | undefined)[];
    resolvedAddress: string;
    lastBlockNumber: number;
    activeAccount: string;
    connectedAccountActive: boolean;
    chainId: string;
    tokenList: TokenIF[];
    tokenMap: Map<string, TokenIF>;
    searchableTokens: TokenIF[];
    openTokenModal: () => void;
    chainData: ChainSpec;
    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    account: string;
    isUserLoggedIn: boolean | undefined;
    baseTokenBalance: string;
    quoteTokenBalance: string;
    baseTokenDexBalance: string;
    quoteTokenDexBalance: string;
    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    handlePulseAnimation: (type: string) => void;
    fullLayoutToggle: JSX.Element;
    cachedQuerySpotPrice: SpotPriceFn;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
    setSimpleRangeWidth: Dispatch<SetStateAction<number>>;
    gasPriceInGwei: number | undefined;
    ethMainnetUsdPrice: number | undefined;
}

// React functional component
export default function PortfolioTabs(props: propsIF) {
    const {
        searchableTokens,
        cachedQuerySpotPrice,
        cachedPositionUpdateQuery,
        isTokenABase,
        cachedFetchTokenPrice,
        tokenMap,
        connectedUserTokens,
        resolvedAddressTokens,
        resolvedAddress,
        lastBlockNumber,
        activeAccount,
        connectedAccountActive,
        chainId,
        tokenList,
        openTokenModal,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        handlePulseAnimation,
        account,
        setExpandTradeTable,
        setSimpleRangeWidth,
        gasPriceInGwei,
        ethMainnetUsdPrice,
    } = props;

    const dispatch = useAppDispatch();
    const crocEnv = useContext(CrocEnvContext);

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
                                searchableTokens,
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
                                searchableTokens,
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
            tokenList: tokenList,
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
    }, [resolvedAddress, connectedAccountActive, diffHashSig(tokenList)]);

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
        lastBlockNumber: lastBlockNumber,
        resolvedAddress: resolvedAddress,
        activeAccount: activeAccount,
        chainId: chainId,
        tokenMap: tokenMap,
    };

    // props for <Exchange/> React Element
    const exchangeProps = {
        cachedFetchTokenPrice: cachedFetchTokenPrice,
        connectedUserTokens: connectedUserTokens,
        resolvedAddressTokens: resolvedAddressTokens,
        connectedAccountActive: connectedAccountActive,
        lastBlockNumber: lastBlockNumber,
        resolvedAddress: resolvedAddress,
        activeAccount: activeAccount,
        chainId: chainId,
        tokenMap: tokenMap,
        openTokenModal: openTokenModal,
    };

    // props for <Range/> React Element
    const rangeProps = {
        cachedQuerySpotPrice: cachedQuerySpotPrice,
        cachedPositionUpdateQuery: cachedPositionUpdateQuery,
        expandTradeTable: false,
        chainData: props.chainData,
        isShowAllEnabled: false,
        account: account,
        currentPositionActive: props.currentPositionActive,
        setCurrentPositionActive: props.setCurrentPositionActive,
        activeAccountPositionData: activeAccountPositionData,
        isOnPortfolioPage: true,
        connectedAccountActive: connectedAccountActive,
        lastBlockNumber: lastBlockNumber,
        chainId: chainId,
        provider: props.provider,
        isUserLoggedIn: props.isUserLoggedIn,
        searchableTokens: searchableTokens,
        baseTokenBalance: baseTokenBalance,
        quoteTokenBalance: quoteTokenBalance,
        baseTokenDexBalance: baseTokenDexBalance,
        quoteTokenDexBalance: quoteTokenDexBalance,
        handlePulseAnimation: handlePulseAnimation,
        setSimpleRangeWidth: setSimpleRangeWidth,
        gasPriceInGwei: gasPriceInGwei,
        ethMainnetUsdPrice: ethMainnetUsdPrice,
        setExpandTradeTable: setExpandTradeTable,
    };

    // props for <Transactions/> React Element
    const transactionsProps = {
        searchableTokens: searchableTokens,
        isTokenABase: isTokenABase,
        activeAccountTransactionData: activeAccountTransactionData,
        connectedAccountActive: connectedAccountActive,
        isShowAllEnabled: false,
        changesInSelectedCandle: undefined,
        tokenList: tokenList,
        chainData: props.chainData,
        blockExplorer: props.chainData.blockExplorer || undefined,
        currentTxActiveInTransactions: props.currentTxActiveInTransactions,
        account: account,
        setCurrentTxActiveInTransactions:
            props.setCurrentTxActiveInTransactions,
        expandTradeTable: false,
        isCandleSelected: false,
        handlePulseAnimation: handlePulseAnimation,
        isOnPortfolioPage: true,
        tokenMap: tokenMap,
        setExpandTradeTable: setExpandTradeTable,
        setSimpleRangeWidth: setSimpleRangeWidth,
        isAccountView: true,
    };

    // Props for <Orders/> React Element
    const ordersProps = {
        searchableTokens: searchableTokens,
        activeAccountLimitOrderData: activeAccountLimitOrderData,
        connectedAccountActive: connectedAccountActive,
        expandTradeTable: false,
        chainData: props.chainData,
        isShowAllEnabled: false,
        account: account,
        currentPositionActive: props.currentPositionActive,
        setCurrentPositionActive: props.setCurrentPositionActive,
        isOnPortfolioPage: true,
        handlePulseAnimation: handlePulseAnimation,
        lastBlockNumber: lastBlockNumber,
        setExpandTradeTable: setExpandTradeTable,
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
