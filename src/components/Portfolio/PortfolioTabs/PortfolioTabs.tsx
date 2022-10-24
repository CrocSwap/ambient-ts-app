// START: Import React and Dongles
import { useEffect, useState, Dispatch, SetStateAction, ReactNode } from 'react';

// START: Import JSX Functional Components
import Wallet from '../../Global/Account/AccountTabs/Wallet/Wallet';
import Exchange from '../../Global/Account/AccountTabs/Exchange/Exchange';
// import TransactionsTable from '../../Global/Account/AccountTabs/Transaction/TransactionsTable';
import TabComponent from '../../Global/TabComponent/TabComponent';

// START: Import Local Files
import styles from './PortfolioTabs.module.css';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { getPositionData } from '../../../App/functions/getPositionData';
import { PositionIF } from '../../../utils/interfaces/PositionIF';
import { TokenIF } from '../../../utils/interfaces/TokenIF';
import openOrdersImage from '../../../assets/images/sidebarImages/openOrders.svg';
import rangePositionsImage from '../../../assets/images/sidebarImages/rangePositions.svg';
import recentTransactionsImage from '../../../assets/images/sidebarImages/recentTransactions.svg';
import walletImage from '../../../assets/images/sidebarImages/wallet.svg';
import exchangeImage from '../../../assets/images/sidebarImages/exchange.svg';
import { CrocEnv, ChainSpec } from '@crocswap-libs/sdk';
import { ethers } from 'ethers';
import { ILimitOrderState, ITransaction } from '../../../utils/state/graphDataSlice';
import { getLimitOrderData } from '../../../App/functions/getLimitOrderData';
// import { getTransactionData } from '../../../App/functions/getTransactionData';
import { TokenPriceFn } from '../../../App/functions/fetchTokenPrice';
import { fetchUserRecentChanges } from '../../../App/functions/fetchUserRecentChanges';
import Orders from '../../Trade/TradeTabs/Orders/Orders';
import Ranges from '../../Trade/TradeTabs/Ranges/Ranges';
import Transactions from '../../Trade/TradeTabs/Transactions/Transactions';

// interface for React functional component props
interface PortfolioTabsPropsIF {
    crocEnv: CrocEnv | undefined;
    provider: ethers.providers.Provider | undefined;
    cachedFetchTokenPrice: TokenPriceFn;
    importedTokens: TokenIF[];
    connectedUserTokens: (TokenIF | undefined)[];
    resolvedAddressTokens: (TokenIF | undefined)[];
    resolvedAddress: string;
    lastBlockNumber: number;
    activeAccount: string;
    connectedAccountActive: boolean;
    chainId: string;
    tokenMap: Map<string, TokenIF>;
    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    rightTabOptions: ReactNode;
    openTokenModal: () => void;
    chainData: ChainSpec;
    openGlobalModal: (content: React.ReactNode, title?: string) => void;
    closeGlobalModal: () => void;
    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    account: string;
    showSidebar: boolean;
    isUserLoggedIn: boolean;
    isAuthenticated: boolean;
    baseTokenBalance: string;
    quoteTokenBalance: string;
    baseTokenDexBalance: string;
    quoteTokenDexBalance: string;

    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
}

// React functional component
export default function PortfolioTabs(props: PortfolioTabsPropsIF) {
    const {
        crocEnv,
        cachedFetchTokenPrice,
        importedTokens,
        connectedUserTokens,
        resolvedAddressTokens,
        resolvedAddress,
        lastBlockNumber,
        activeAccount,
        connectedAccountActive,
        chainId,
        tokenMap,
        selectedOutsideTab,
        setSelectedOutsideTab,
        rightTabOptions,
        outsideControl,
        setOutsideControl,
        openTokenModal,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,

        account,
    } = props;

    const graphData = useAppSelector((state) => state?.graphData);
    const connectedAccountPositionData = graphData.positionsByUser.positions;
    const connectedAccountLimitOrderData = graphData.limitOrdersByUser.limitOrders;
    const connectedAccountTransactionData = graphData.changesByUser.changes;

    const [otherAccountPositionData, setOtherAccountPositionData] = useState<PositionIF[]>([]);
    const [otherAccountLimitOrderData, setOtherAccountLimitOrderData] = useState<
        ILimitOrderState[]
    >([]);
    const [otherAccountTransactionData, setOtherAccountTransactionData] = useState<ITransaction[]>(
        [],
    );

    useEffect(() => {
        console.log({ connectedAccountPositionData });
    }, [connectedAccountPositionData]);

    const httpGraphCacheServerDomain = 'https://809821320828123.de:5000';

    const userPositionsCacheEndpoint = httpGraphCacheServerDomain + '/user_positions?';
    const userLimitOrdersCacheEndpoint = httpGraphCacheServerDomain + '/user_limit_order_states?';
    // const userTransactionsCacheEndpoint = httpGraphCacheServerDomain + '/user_recent_changes?';

    const getUserPositions = async (accountToSearch: string) =>
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
                                importedTokens,
                                crocEnv,
                                chainId,
                                lastBlockNumber,
                            );
                        }),
                    ).then((updatedPositions) => {
                        setOtherAccountPositionData(updatedPositions);
                    });
                }
            })
            .catch(console.log);

    const getUserLimitOrders = async (accountToSearch: string) =>
        fetch(
            userLimitOrdersCacheEndpoint +
                new URLSearchParams({
                    user: accountToSearch,
                    chainId: chainId,
                    ensResolution: 'true',
                }),
        )
            .then((response) => response?.json())
            .then((json) => {
                const userLimitOrderStates = json?.data;
                if (userLimitOrderStates) {
                    Promise.all(
                        userLimitOrderStates.map((limitOrder: ILimitOrderState) => {
                            return getLimitOrderData(limitOrder, importedTokens);
                        }),
                    ).then((updatedLimitOrderStates) => {
                        setOtherAccountLimitOrderData(updatedLimitOrderStates);
                    });
                }
            })
            .catch(console.log);

    const getUserTransactions = async (accountToSearch: string) =>
        fetchUserRecentChanges({
            importedTokens: importedTokens,
            user: accountToSearch,
            chainId: chainId,
            annotate: true,
            addValue: true,
            simpleCalc: true,
            annotateMEV: false,
            ensResolution: true,
            n: 100,
        })
            .then((updatedTransactions) => {
                if (updatedTransactions) {
                    setOtherAccountTransactionData(updatedTransactions);
                }
            })
            .catch(console.log);

    useEffect(() => {
        (async () => {
            if (!connectedAccountActive && resolvedAddress) {
                await getUserPositions(resolvedAddress);
                await getUserLimitOrders(resolvedAddress);
                await getUserTransactions(resolvedAddress);
            }
        })();
    }, [resolvedAddress, connectedAccountActive]);

    const activeAccountPositionData = connectedAccountActive
        ? connectedAccountPositionData
        : otherAccountPositionData;
    // eslint-disable-next-line
    const activeAccountLimitOrderData = connectedAccountActive
        ? connectedAccountLimitOrderData
        : otherAccountLimitOrderData;

    const activeAccountTransactionData = connectedAccountActive
        ? connectedAccountTransactionData
        : otherAccountTransactionData;

    // console.log({ connectedAccountActive });
    // console.log({ connectedAccountTransactionData });
    // console.log({ otherAccountTransactionData });
    // console.log({ activeAccountTransactionData });

    // props for <Wallet/> React Element
    const walletProps = {
        crocEnv: crocEnv,
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
        crocEnv: crocEnv,
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
        crocEnv: props.crocEnv,
        expandTradeTable: false,
        chainData: props.chainData,
        isShowAllEnabled: false,
        account: account,
        graphData: graphData,
        openGlobalModal: props.openGlobalModal,
        currentPositionActive: props.currentPositionActive,
        closeGlobalModal: props.closeGlobalModal,
        setCurrentPositionActive: props.setCurrentPositionActive,
        showSidebar: props.showSidebar,
        activeAccountPositionData: activeAccountPositionData,
        isOnPortfolioPage: true,
        connectedAccountActive: connectedAccountActive,
        lastBlockNumber: lastBlockNumber,
        chainId: chainId,
        provider: props.provider,
        isUserLoggedIn: props.isUserLoggedIn,
        isAuthenticated: props.isAuthenticated,
        importedTokens: importedTokens,
        baseTokenBalance: baseTokenBalance,
        quoteTokenBalance: quoteTokenBalance,
        baseTokenDexBalance: baseTokenDexBalance,
        quoteTokenDexBalance: quoteTokenDexBalance,
    };

    // props for <Transactions/> React Element
    const transactionsProps = {
        activeAccountTransactionData: activeAccountTransactionData,
        connectedAccountActive: connectedAccountActive,
        isShowAllEnabled: false,
        changesInSelectedCandle: undefined,
        tokenMap: tokenMap,
        graphData: graphData,
        chainData: props.chainData,
        blockExplorer: props.chainData.blockExplorer || undefined,
        currentTxActiveInTransactions: props.currentTxActiveInTransactions,
        account: account,
        setCurrentTxActiveInTransactions: props.setCurrentTxActiveInTransactions,
        expandTradeTable: false,

        isCandleSelected: false,
        // filter: props.filter,
        closeGlobalModal: props.closeGlobalModal,

        openGlobalModal: props.openGlobalModal,
        showSidebar: props.showSidebar,

        isOnPortfolioPage: true,
    };

    // Props for <Orders/> React Element
    const ordersProps = {
        activeAccountLimitOrderData: activeAccountLimitOrderData,
        connectedAccountActive: connectedAccountActive,
        crocEnv: props.crocEnv,
        expandTradeTable: false,
        chainData: props.chainData,
        isShowAllEnabled: false,
        account: account,
        graphData: graphData,
        openGlobalModal: props.openGlobalModal,
        currentPositionActive: props.currentPositionActive,
        closeGlobalModal: props.closeGlobalModal,
        setCurrentPositionActive: props.setCurrentPositionActive,
        showSidebar: props.showSidebar,
        isOnPortfolioPage: true,
    };

    const accountTabData = [
        {
            label: 'Transactions',
            content: <Transactions {...transactionsProps} />,
            icon: recentTransactionsImage,
        },
        { label: 'Limit Orders', content: <Orders {...ordersProps} />, icon: openOrdersImage },
        { label: 'Ranges', content: <Ranges {...rangeProps} />, icon: rangePositionsImage },
        {
            label: 'Exchange Balances',
            content: <Exchange {...exchangeProps} />,
            icon: exchangeImage,
        },
        { label: 'Wallet Balances', content: <Wallet {...walletProps} />, icon: walletImage },
    ];

    return (
        <div className={styles.tabs_container}>
            <TabComponent
                data={accountTabData}
                rightTabOptions={rightTabOptions}
                selectedOutsideTab={selectedOutsideTab}
                setSelectedOutsideTab={setSelectedOutsideTab}
                outsideControl={outsideControl}
                setOutsideControl={setOutsideControl}
            />
        </div>
    );
}
