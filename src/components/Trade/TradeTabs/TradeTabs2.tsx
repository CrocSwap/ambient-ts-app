import { useState, useEffect } from 'react';

import { useAppSelector } from '../../../utils/hooks/reduxToolkit';

import Transactions from './Transactions/Transactions';
import Orders from './Orders/Orders';
// import DropdownMenu from '../../Global/DropdownMenu/DropdownMenu';
// import DropdownMenuContainer from '../../Global/DropdownMenu/DropdownMenuContainer/DropdownMenuContainer';
// import DropdownMenuItem from '../../Global/DropdownMenu/DropdownMenuItem/DropdownMenuItem';
// import { BiDownArrow } from 'react-icons/bi';
import Ranges from './Ranges/Ranges';
import { useTokenMap } from '../../../App/components/Sidebar/useTokenMap';
import TabComponent from '../../Global/TabComponent/TabComponent';

interface ITabsProps {
    account: string;
    isAuthenticated: boolean;
    isWeb3Enabled: boolean;
    lastBlockNumber: number;
    chainId: string;
}

export default function TradeTabs2(props: ITabsProps) {
    const [isShowAllEnabled, setIsShowAllEnabled] = useState<boolean>(true);

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
    };
    // Props for <Transactions/> React Element
    const transactionsProps = {
        isShowAllEnabled: isShowAllEnabled,
        tokenMap: tokenMap,
        graphData: graphData,
        chainId: props.chainId,
    };

    const tradeTabData = [
        { label: 'Ranges', content: <Ranges {...rangesProps} /> },
        { label: 'Orders', content: <Orders /> },
        { label: 'Transactions', content: <Transactions {...transactionsProps} /> },
    ];
    // -------------------------------END OF DATA-----------------------------------------
    return <>{<TabComponent data={tradeTabData} />}</>;
}
