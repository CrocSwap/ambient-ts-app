import styles from './Tabs.module.css';
import { useState, useEffect } from 'react';
import TabNavItem from './TabNavItem/TabNavItem';
import TabContent from './TabContent/TabContent';
import Positions from '../../Trade/Positions/Positions';
import LimitOrders from '../LimitOrder/LimitOrders';
import Transactions from '../Transactions/Transactions';

import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import Toggle2 from '../Toggle/Toggle2';

interface ITabsProps {
    account: string;
    isAuthenticated: boolean;
    isWeb3Enabled: boolean;
    lastBlockNumber: number;
}

export default function Tabs(props: ITabsProps) {
    const [activeTab, setActiveTab] = useState('tab1');
    const [isShowAllEnabled, setIsShowAllEnabled] = useState<boolean>(true);

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

    let label = '';
    switch (activeTab) {
        case 'tab1':
            label = 'Positions';
            break;
        case 'tab2':
            label = 'Orders';
            break;
        case 'tab3':
            label = 'Transactions';
            break;
        default:
            break;
    }

    const positionsOnlyToggle = (
        <span className={styles.options_toggle}>
            {isShowAllEnabled ? 'All ' + label : 'My ' + label}

            <Toggle2
                isOn={isShowAllEnabled}
                handleToggle={() => {
                    setHasInitialized(true);
                    setIsShowAllEnabled(!isShowAllEnabled);
                }}
                id='positions_only_toggle'
                disabled={!props.isAuthenticated || !props.isWeb3Enabled}
            />
        </span>
    );

    const tabData = [
        { title: 'Ranges', id: 'tab1' },
        { title: 'Orders', id: 'tab2' },
        { title: 'Transactions', id: 'tab3' },
        { title: 'Leaderboard', id: 'tab4' },
        { title: 'Info', id: 'tab5' },
    ];

    return (
        <div className={styles.tabs_container}>
            <div className={styles.tabs}>
                <ul className={styles.tab_navs}>
                    {tabData.map((tab) => (
                        <TabNavItem
                            key={tab.title}
                            title={tab.title}
                            id={tab.id}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                    ))}
                </ul>
                <div className={styles.option_toggles}>{label ? positionsOnlyToggle : null}</div>
            </div>
            <div className={styles.tabs_outlet}>
                <TabContent id='tab1' activeTab={activeTab}>
                    <Positions
                        isShowAllEnabled={isShowAllEnabled}
                        notOnTradeRoute={false}
                        graphData={graphData}
                        lastBlockNumber={props.lastBlockNumber}
                    />
                </TabContent>
                <TabContent id='tab2' activeTab={activeTab}>
                    <LimitOrders />
                </TabContent>
                <TabContent id='tab3' activeTab={activeTab}>
                    <Transactions
                        isShowAllEnabled={isShowAllEnabled}
                        notOnTradeRoute={false}
                        graphData={graphData}
                    />
                </TabContent>
                <TabContent id='tab4' activeTab={activeTab}>
                    <p>tab4 works!</p>
                </TabContent>
            </div>
        </div>
    );
}
