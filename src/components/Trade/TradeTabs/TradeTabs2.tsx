import { useState, useEffect, Dispatch, SetStateAction } from 'react';

import { useAppSelector } from '../../../utils/hooks/reduxToolkit';

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
import { useTokenMap } from '../../../App/components/Sidebar/useTokenMap';
import TabComponent from '../../Global/TabComponent/TabComponent';
import PositionsOnlyToggle from './PositionsOnlyToggle/PositionsOnlyToggle';

interface ITabsProps {
    account: string;
    isAuthenticated: boolean;
    isWeb3Enabled: boolean;
    lastBlockNumber: number;
    chainId: string;
    switchTabToTransactions: boolean;
    setSwitchTabToTransactions: Dispatch<SetStateAction<boolean>>;
    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;

    expandTradeTable: boolean;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
}

export default function TradeTabs2(props: ITabsProps) {
    const { isShowAllEnabled, setIsShowAllEnabled } = props;

    const graphData = useAppSelector((state) => state?.graphData);

    const tokenMap = useTokenMap();

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
            if (!isShowAllEnabled && userPositions.length < 1) {
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

    const outsideTabControl = {
        switchToTab: props.switchTabToTransactions,
        tabToSwitchTo: 2,
        stateHandler: props.setSwitchTabToTransactions,
    };
    // -------------------------------END OF DATA-----------------------------------------
    return (
        <>
            {
                <TabComponent
                    data={tradeTabData}
                    outsideTabControl={outsideTabControl}
                    rightTabOptions={<PositionsOnlyToggle {...positionsOnlyToggleProps} />}
                />
            }
        </>
    );
}
