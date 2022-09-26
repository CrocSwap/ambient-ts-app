import { useState, useEffect, Dispatch, SetStateAction, useRef } from 'react';

import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { ethers } from 'ethers';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import Transactions from './Transactions/Transactions';
import styles from './TradeTabs2.module.css';
import Orders from './Orders/Orders';
// import DropdownMenu from '../../Global/DropdownMenu/DropdownMenu';
// import DropdownMenuContainer from '../../Global/DropdownMenu/DropdownMenuContainer/DropdownMenuContainer';
// import DropdownMenuItem from '../../Global/DropdownMenu/DropdownMenuItem/DropdownMenuItem';
// import { BiDownArrow } from 'react-icons/bi';

import openOrdersImage from '../../../assets/images/sidebarImages/openOrders.svg';
import rangePositionsImage from '../../../assets/images/sidebarImages/rangePositions.svg';
import recentTransactionsImage from '../../../assets/images/sidebarImages/recentTransactions.svg';
import Ranges from './Ranges/Ranges';
import TabComponent from '../../Global/TabComponent/TabComponent';
import PositionsOnlyToggle from './PositionsOnlyToggle/PositionsOnlyToggle';
import { TokenIF } from '../../../utils/interfaces/TokenIF';
import { CandleData } from '../../../utils/state/graphDataSlice';
import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';

interface ITabsProps {
    isUserLoggedIn: boolean;
    crocEnv: CrocEnv | undefined;
    provider: ethers.providers.Provider | undefined;
    account: string;
    isAuthenticated: boolean;
    isWeb3Enabled: boolean;
    lastBlockNumber: number;
    chainId: string;
    chainData: ChainSpec;
    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    tokenMap: Map<string, TokenIF>;
    baseTokenBalance: string;
    quoteTokenBalance: string;
    baseTokenDexBalance: string;
    quoteTokenDexBalance: string;
    expandTradeTable: boolean;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
    isCandleSelected: boolean | undefined;
    filter: CandleData | undefined;
    setIsCandleSelected: Dispatch<SetStateAction<boolean | undefined>>;
    setTransactionFilter: Dispatch<SetStateAction<CandleData | undefined>>;
    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;

    openGlobalModal: (content: React.ReactNode) => void;

    closeGlobalModal: () => void;
}

export default function TradeTabs2(props: ITabsProps) {
    const {
        isUserLoggedIn,
        crocEnv,
        chainId,
        chainData,
        isAuthenticated,
        isWeb3Enabled,
        account,
        isShowAllEnabled,
        setIsShowAllEnabled,
        tokenMap,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        provider,
        isCandleSelected,
        setIsCandleSelected,
        filter,
        setTransactionFilter,
        lastBlockNumber,
        expandTradeTable,
        setExpandTradeTable,
        currentPositionActive,
        setCurrentPositionActive,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
        selectedOutsideTab,
        setSelectedOutsideTab,
        outsideControl,
        setOutsideControl,
    } = props;

    const graphData = useAppSelector((state) => state?.graphData);
    const tradeData = useAppSelector((state) => state?.tradeData);
    // const userData = useAppSelector((state) => state?.userData);

    const userChanges = graphData?.changesByUser?.changes;
    const userLimitOrders = graphData?.limitOrdersByUser?.limitOrders;
    const userPositions = graphData?.positionsByUser?.positions;
    // const poolPositions = graphData?.positionsByPool?.positions;

    const [hasInitialized, setHasInitialized] = useState(false);

    const selectedBase = tradeData.baseToken.address;
    const selectedQuote = tradeData.quoteToken.address;

    const userChangesMatchingTokenSelection = userChanges.filter((userChange) => {
        return (
            userChange.base.toLowerCase() === selectedBase.toLowerCase() &&
            userChange.quote.toLowerCase() === selectedQuote.toLowerCase()
        );
    });

    const userLimitOrdersMatchingTokenSelection = userLimitOrders.filter((userLimitOrder) => {
        return (
            userLimitOrder.base.toLowerCase() === selectedBase.toLowerCase() &&
            userLimitOrder.quote.toLowerCase() === selectedQuote.toLowerCase()
        );
    });

    const userPositionsMatchingTokenSelection = userPositions.filter((userPosition) => {
        return (
            userPosition.base.toLowerCase() === selectedBase.toLowerCase() &&
            userPosition.quote.toLowerCase() === selectedQuote.toLowerCase()
        );
    });

    const matchingUserChangesLength = userChangesMatchingTokenSelection.length;
    const matchingUserPositionsLength = userLimitOrdersMatchingTokenSelection.length;
    const matchingUserLimitOrdersLength = userPositionsMatchingTokenSelection.length;

    useEffect(() => {
        setHasInitialized(false);
    }, [
        account,
        isUserLoggedIn,
        // userData.isLoggedIn,
        matchingUserChangesLength,
        matchingUserLimitOrdersLength,
        matchingUserPositionsLength,
        selectedOutsideTab,
        selectedBase,
        selectedQuote,
    ]);

    useEffect(() => {
        // console.log({ hasInitialized });
        // console.log({ userChangesLength });
        // console.log({ userPositions });
        // console.log({ selectedOutsideTab });
        if (!hasInitialized) {
            if (selectedOutsideTab === 0) {
                if (!isCandleSelected && !isShowAllEnabled && matchingUserChangesLength < 1) {
                    setIsShowAllEnabled(true);
                } else if (matchingUserChangesLength < 1) {
                    return;
                } else if (isShowAllEnabled && matchingUserChangesLength >= 1) {
                    setIsShowAllEnabled(false);
                }
            } else if (selectedOutsideTab === 1) {
                if (!isCandleSelected && !isShowAllEnabled && matchingUserLimitOrdersLength < 1) {
                    setIsShowAllEnabled(true);
                } else if (matchingUserLimitOrdersLength < 1) {
                    return;
                } else if (isShowAllEnabled && matchingUserLimitOrdersLength >= 1) {
                    setIsShowAllEnabled(false);
                }
            } else if (selectedOutsideTab === 2) {
                if (!isCandleSelected && !isShowAllEnabled && matchingUserPositionsLength < 1) {
                    setIsShowAllEnabled(true);
                } else if (matchingUserPositionsLength < 1) {
                    return;
                } else if (isShowAllEnabled && matchingUserPositionsLength >= 1) {
                    setIsShowAllEnabled(false);
                }
                setHasInitialized(true);
            }
        }
    }, [
        hasInitialized,
        selectedOutsideTab,
        isShowAllEnabled,
        matchingUserPositionsLength,
        matchingUserChangesLength,
        matchingUserLimitOrdersLength,
    ]);

    // -------------------------------DATA-----------------------------------------

    // Props for <Ranges/> React Element
    const rangesProps = {
        isUserLoggedIn: isUserLoggedIn,
        crocEnv: crocEnv,
        chainData: chainData,
        baseTokenBalance: baseTokenBalance,
        quoteTokenBalance: quoteTokenBalance,
        baseTokenDexBalance: baseTokenDexBalance,
        quoteTokenDexBalance: quoteTokenDexBalance,

        provider: provider,
        account: account,
        isAuthenticated: isAuthenticated,
        chainId: chainId,
        isShowAllEnabled: isShowAllEnabled,
        notOnTradeRoute: false,
        graphData: graphData,
        lastBlockNumber: lastBlockNumber,
        expandTradeTable: expandTradeTable,
        currentPositionActive: currentPositionActive,
        setCurrentPositionActive: setCurrentPositionActive,
        openGlobalModal: props.openGlobalModal,

        closeGlobalModal: props.closeGlobalModal,
    };
    // Props for <Transactions/> React Element
    const transactionsProps = {
        isShowAllEnabled: isShowAllEnabled,
        tokenMap: tokenMap,
        graphData: graphData,
        chainData: chainData,
        blockExplorer: chainData.blockExplorer || undefined,
        currentTxActiveInTransactions: currentTxActiveInTransactions,
        account: account,
        setCurrentTxActiveInTransactions: setCurrentTxActiveInTransactions,
        expandTradeTable: expandTradeTable,

        isCandleSelected: isCandleSelected,
        filter: filter,

        openGlobalModal: props.openGlobalModal,
    };
    // Props for <Orders/> React Element
    const ordersProps = {
        expandTradeTable: expandTradeTable,
        isShowAllEnabled: isShowAllEnabled,
        account: account,
        graphData: graphData,
    };
    // props for <PositionsOnlyToggle/> React Element

    const positionsOnlyToggleProps = {
        isShowAllEnabled: isShowAllEnabled,
        isAuthenticated: isAuthenticated,
        isWeb3Enabled: isWeb3Enabled,
        setHasInitialized: setHasInitialized,
        setIsShowAllEnabled: setIsShowAllEnabled,
        setIsCandleSelected: setIsCandleSelected,
        setTransactionFilter: setTransactionFilter,
        expandTradeTable: expandTradeTable,
        setExpandTradeTable: setExpandTradeTable,
    };

    // data for headings of each of the three tabs
    const tradeTabData = [
        {
            label: 'Transactions',
            content: <Transactions {...transactionsProps} />,
            icon: recentTransactionsImage,
        },
        { label: 'Limit Orders', content: <Orders {...ordersProps} />, icon: openOrdersImage },
        { label: 'Ranges', content: <Ranges {...rangesProps} />, icon: rangePositionsImage },
    ];

    // -------------------------------END OF DATA-----------------------------------------
    const tabComponentRef = useRef<HTMLDivElement>(null);

    const clickOutsideHandler = () => {
        setCurrentTxActiveInTransactions('');
        setCurrentPositionActive('');
    };

    useOnClickOutside(tabComponentRef, clickOutsideHandler);

    return (
        <div ref={tabComponentRef} className={styles.trade_tab_container}>
            {
                <TabComponent
                    data={tradeTabData}
                    rightTabOptions={<PositionsOnlyToggle {...positionsOnlyToggleProps} />}
                    selectedOutsideTab={selectedOutsideTab}
                    setSelectedOutsideTab={setSelectedOutsideTab}
                    outsideControl={outsideControl}
                    setOutsideControl={setOutsideControl}
                />
            }
        </div>
    );
}
