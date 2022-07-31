import styles from './TradeTabs2.module.css';
import { useState, useEffect } from 'react';
import TabNavItem from '../../Global/Tabs/TabNavItem/TabNavItem';
import Positions from './Positions/Positions';
import TabContent from '../../Global/Tabs/TabContent/TabContent';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';

import Transactions from './Transactions/Transactions';
import Toggle2 from '../../Global/Toggle/Toggle2';
import Orders from './Orders/Orders';
import DropdownMenu from '../../Global/DropdownMenu/DropdownMenu';
import DropdownMenuContainer from '../../Global/DropdownMenu/DropdownMenuContainer/DropdownMenuContainer';
import DropdownMenuItem from '../../Global/DropdownMenu/DropdownMenuItem/DropdownMenuItem';
import { BiDownArrow } from 'react-icons/bi';
import Ranges from './Ranges/Ranges';
import { useTokenMap } from '../../../App/components/Sidebar/useTokenMap';

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

    const rangessWithData = (
        <Ranges
            isShowAllEnabled={isShowAllEnabled}
            notOnTradeRoute={false}
            graphData={graphData}
            lastBlockNumber={props.lastBlockNumber}
        />
    );

    const ordersWithData = <Orders />;

    const transactionsWithData = (
        <Transactions
            isShowAllEnabled={isShowAllEnabled}
            graphData={graphData}
            tokenMap={tokenMap}
            chainId={props.chainId}
        />
    );

    const tradeTabData = [
        { label: 'Ranges', content: rangessWithData },
        { label: 'Orders', content: ordersWithData },
        { label: 'Transactions', content: transactionsWithData },
    ];
    return <div className={styles.row}>{ordersWithData}</div>;
}
