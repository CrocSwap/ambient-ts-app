import styles from './Tabs.module.css';
import { useState, useEffect } from 'react';
import TabNavItem from './TabNavItem/TabNavItem';
import TabContent from './TabContent/TabContent';
import Positions from '../../Trade/Positions/Positions';
import LimitOrders from '../../Trade/LimitOrders/LimitOrders';

import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import Toggle2 from '../Toggle/Toggle2';

interface ITabsProps {
    account: string;
    isAuthenticated: boolean;
    isWeb3Enabled: boolean;
}

export default function Tabs(props: ITabsProps) {
    const [activeTab, setActiveTab] = useState('tab1');
    const [isAllPositionsEnabled, setIsAllPositionsEnabled] = useState<boolean>(true);

    const graphData = useAppSelector((state) => state?.graphData);

    const userPositions = graphData?.positionsByUser?.positions;
    // const poolPositions = graphData?.positionsByPool?.positions;

    const [hasInitialized, setHasInitialized] = useState(false);

    useEffect(() => {
        setHasInitialized(false);
    }, [props.account, props.isAuthenticated]);

    useEffect(() => {
        // console.log({ hasInitialized });
        // console.log({ isAllPositionsEnabled });
        // console.log({ userPositions });
        if (!hasInitialized) {
            if (!isAllPositionsEnabled && userPositions.length < 1) {
                setIsAllPositionsEnabled(true);
            } else if (userPositions.length < 1) {
                return;
            } else if (isAllPositionsEnabled && userPositions.length >= 1) {
                setIsAllPositionsEnabled(false);
            }
            setHasInitialized(true);
        }
    }, [hasInitialized, isAllPositionsEnabled, JSON.stringify(userPositions)]);

    let label = '';
    switch (activeTab) {
        case 'tab1':
            label = 'Positions';
            break;
        case 'tab2':
            label = 'Orders';
            break;
        case 'tab3':
            label = 'TXs';
            break;
        default:
            break;
    }

    const positionsOnlyToggle = (
        <span className={styles.options_toggle}>
            {isAllPositionsEnabled ? 'All ' + label : 'My ' + label}

            <Toggle2
                isOn={isAllPositionsEnabled}
                handleToggle={() => {
                    setHasInitialized(true);
                    setIsAllPositionsEnabled(!isAllPositionsEnabled);
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
                        isAllPositionsEnabled={isAllPositionsEnabled}
                        notOnTradeRoute={false}
                        graphData={graphData}
                    />
                </TabContent>
                <TabContent id='tab2' activeTab={activeTab}>
                    <LimitOrders />
                </TabContent>
                <TabContent id='tab3' activeTab={activeTab}>
                    <p>Tab 3 works!</p>
                </TabContent>
                <TabContent id='tab4' activeTab={activeTab}>
                    <p>tab4 works!</p>
                </TabContent>
            </div>
        </div>
    );
}
