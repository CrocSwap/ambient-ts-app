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
    pendingTransactions: string[];

    openGlobalModal: (content: React.ReactNode) => void;

    closeGlobalModal: () => void;
}

export default function TradeTabs2(props: ITabsProps) {
    const {
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
        pendingTransactions,
    } = props;

    const graphData = useAppSelector((state) => state?.graphData);
    const userData = useAppSelector((state) => state?.userData);

    const userPositions = graphData?.positionsByUser?.positions;
    const userChanges = graphData?.changesByUser?.changes;
    const userLimitOrders = graphData?.limitOrdersByUser?.limitOrders;
    // const poolPositions = graphData?.positionsByPool?.positions;

    const [hasInitialized, setHasInitialized] = useState(false);

    const userChangesLength = userChanges.length;
    const userPositionsLength = userPositions.length;
    const userLimitOrdersLength = userLimitOrders.length;

    useEffect(() => {
        setHasInitialized(false);
    }, [
        account,
        userData.isLoggedIn,
        userChangesLength,
        userLimitOrdersLength,
        userPositionsLength,
        selectedOutsideTab,
    ]);

    useEffect(() => {
        // console.log({ hasInitialized });
        // console.log({ userChangesLength });
        // console.log({ userPositions });
        // console.log({ selectedOutsideTab });
        if (!hasInitialized) {
            if (selectedOutsideTab === 0) {
                if (!isCandleSelected && !isShowAllEnabled && userPositions.length < 1) {
                    setIsShowAllEnabled(true);
                } else if (userPositions.length < 1) {
                    return;
                } else if (isShowAllEnabled && userPositions.length >= 1) {
                    setIsShowAllEnabled(false);
                }
            } else if (selectedOutsideTab === 1) {
                if (!isCandleSelected && !isShowAllEnabled && userLimitOrders.length < 1) {
                    setIsShowAllEnabled(true);
                } else if (userLimitOrders.length < 1) {
                    return;
                } else if (isShowAllEnabled && userLimitOrders.length >= 1) {
                    setIsShowAllEnabled(false);
                }
            } else if (selectedOutsideTab === 2) {
                if (!isCandleSelected && !isShowAllEnabled && userChanges.length < 1) {
                    setIsShowAllEnabled(true);
                } else if (userChanges.length < 1) {
                    return;
                } else if (isShowAllEnabled && userChanges.length >= 1) {
                    setIsShowAllEnabled(false);
                }
                setHasInitialized(true);
            }
        }
    }, [
        hasInitialized,
        isShowAllEnabled,
        userPositions.length,
        userChanges.length,
        userLimitOrders.length,
    ]);

    // -------------------------------DATA-----------------------------------------

    // Props for <Ranges/> React Element
    const rangesProps = {
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
        pendingTransactions: pendingTransactions,
        openGlobalModal: props.openGlobalModal,

        closeGlobalModal: props.closeGlobalModal,
    };
    // Props for <Transactions/> React Element
    const transactionsProps = {
        isShowAllEnabled: isShowAllEnabled,
        tokenMap: tokenMap,
        graphData: graphData,
        chainId: chainId,
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
        { label: 'Ranges', content: <Ranges {...rangesProps} />, icon: rangePositionsImage },
        { label: 'Limit Orders', content: <Orders {...ordersProps} />, icon: openOrdersImage },
        {
            label: 'Transactions',
            content: <Transactions {...transactionsProps} />,
            icon: recentTransactionsImage,
        },
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
