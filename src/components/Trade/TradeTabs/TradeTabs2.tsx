import { useState, useEffect, Dispatch, SetStateAction } from 'react';

import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { ethers } from 'ethers';

import Transactions from './Transactions/Transactions';
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

interface ITabsProps {
    provider: ethers.providers.Provider | undefined;
    account: string;
    isAuthenticated: boolean;
    isWeb3Enabled: boolean;
    lastBlockNumber: number;
    chainId: string;
    switchTabToTransactions: boolean;
    setSwitchTabToTransactions: Dispatch<SetStateAction<boolean>>;
    setSwitchTabToOrders: Dispatch<SetStateAction<boolean>>;
    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;

    tokenMap: Map<string, TokenIF>;
    expandTradeTable: boolean;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
    isCandleSelected: boolean | undefined;
    filter: CandleData | undefined;
    setIsCandleSelected: Dispatch<SetStateAction<boolean | undefined>>;
    setTransactionFilter: Dispatch<SetStateAction<CandleData | undefined>>;

    switchTabToOrders: boolean;

    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
}

export default function TradeTabs2(props: ITabsProps) {
    const {
        chainId,
        isShowAllEnabled,
        setIsShowAllEnabled,
        tokenMap,
        provider,
        isCandleSelected,
        setIsCandleSelected,
        filter,
        setTransactionFilter,
        switchTabToOrders,
        setSwitchTabToOrders,
        setSwitchTabToTransactions,
    } = props;

    const graphData = useAppSelector((state) => state?.graphData);

    const userPositions = graphData?.positionsByUser?.positions;
    // const poolPositions = graphData?.positionsByPool?.positions;

    const [hasInitialized, setHasInitialized] = useState(false);

    useEffect(() => {
        setHasInitialized(false);
    }, [props.account, props.isAuthenticated]);

    useEffect(() => {
        // console.log({ hasInitialized });
        // console.log({ isShowAllEnabled });
        // console.log({ userPositions });
        if (!hasInitialized) {
            if (!isCandleSelected && !isShowAllEnabled && userPositions.length < 1) {
                setIsShowAllEnabled(true);
            } else if (userPositions.length < 1) {
                return;
            } else if (isShowAllEnabled && userPositions.length >= 1) {
                setIsShowAllEnabled(false);
            }
            setHasInitialized(true);
        }
    }, [hasInitialized, isShowAllEnabled, JSON.stringify(userPositions)]);

    // -------------------------------DATA-----------------------------------------

    // Props for <Ranges/> React Element
    const rangesProps = {
        provider: provider,
        chainId: chainId,
        isShowAllEnabled: isShowAllEnabled,
        notOnTradeRoute: false,
        graphData: graphData,
        lastBlockNumber: props.lastBlockNumber,

        expandTradeTable: props.expandTradeTable,
    };
    // Props for <Transactions/> React Element
    const transactionsProps = {
        isShowAllEnabled: isShowAllEnabled,
        tokenMap: tokenMap,
        graphData: graphData,
        chainId: props.chainId,
        currentTxActiveInTransactions: props.currentTxActiveInTransactions,

        setCurrentTxActiveInTransactions: props.setCurrentTxActiveInTransactions,
        expandTradeTable: props.expandTradeTable,

        isCandleSelected: isCandleSelected,
        filter: filter,
    };
    // Props for <Orders/> React Element
    const ordersProps = {
        expandTradeTable: props.expandTradeTable,
    };
    // props for <PositionsOnlyToggle/> React Element

    const positionsOnlyToggleProps = {
        isShowAllEnabled: isShowAllEnabled,
        isAuthenticated: props.isAuthenticated,
        isWeb3Enabled: props.isWeb3Enabled,
        setHasInitialized: setHasInitialized,
        setIsShowAllEnabled: setIsShowAllEnabled,
        setIsCandleSelected: setIsCandleSelected,
        setTransactionFilter: setTransactionFilter,
        expandTradeTable: props.expandTradeTable,
        setExpandTradeTable: props.setExpandTradeTable,
    };

    const tradeTabData = [
        { label: 'Ranges', content: <Ranges {...rangesProps} />, icon: rangePositionsImage },
        { label: 'Orders', content: <Orders {...ordersProps} />, icon: openOrdersImage },
        {
            label: 'Transactions',
            content: <Transactions {...transactionsProps} />,
            icon: recentTransactionsImage,
        },
    ];

    console.log({ switchTabToOrders });
    console.log(props.switchTabToTransactions);

    const [tabToSwitchTo, setTabToSwitchTo] = useState(0);

    function handleSwitchState() {
        if (switchTabToOrders) {
            setSwitchTabToTransactions(false);
            setTabToSwitchTo(1);
        } else if (props.switchTabToTransactions) {
            setSwitchTabToOrders(false);
            setTabToSwitchTo(2);
        }
    }

    console.log(tabToSwitchTo);

    const outsideTabControl = {
        switchToTab: props.switchTabToTransactions,
        tabToSwitchTo: tabToSwitchTo,
        stateHandler: props.setSwitchTabToTransactions,
    };
    useEffect(() => {
        handleSwitchState();
    }, [switchTabToOrders, props.switchTabToTransactions, outsideTabControl]);
    // -------------------------------END OF DATA-----------------------------------------
    return (
        <>
            {
                <TabComponent
                    data={tradeTabData}
                    outsideTabControl={outsideTabControl}
                    rightTabOptions={<PositionsOnlyToggle {...positionsOnlyToggleProps} />}
                    selectedOutsideTab={props.selectedOutsideTab}
                    setSelectedOutsideTab={props.setSelectedOutsideTab}
                    outsideControl={props.outsideControl}
                    setOutsideControl={props.setOutsideControl}
                />
            }
        </>
    );
}
