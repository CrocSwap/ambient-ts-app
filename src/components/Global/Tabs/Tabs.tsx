import styles from './Tabs.module.css';
import { useState, useEffect } from 'react';
import TabNavItem from './TabNavItem/TabNavItem';
import TabContent from './TabContent/TabContent';
import Toggle from '../Toggle/Toggle';
import Positions from '../../Trade/Positions/Positions';
import LimitOrders from '../../Trade/LimitOrders/LimitOrders';

import { useAppSelector } from '../../../utils/hooks/reduxToolkit';

interface ITabsProps {
    account: string;
    isAuthenticated: boolean;
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
                console.log('firing');
                setIsAllPositionsEnabled(true);
            } else if (userPositions.length < 1) {
                return;
            } else if (isAllPositionsEnabled && userPositions.length >= 1) {
                setIsAllPositionsEnabled(false);
            }
            setHasInitialized(true);
        }
    }, [hasInitialized, isAllPositionsEnabled, JSON.stringify(userPositions)]);

    const positionsOnlyToggle = (
        <span className={styles.options_toggle}>
            {isAllPositionsEnabled ? 'All Positions' : 'My Positions'}
            <div className={styles.toggle_container}>
                <Toggle
                    isOn={isAllPositionsEnabled}
                    handleToggle={() => {
                        setHasInitialized(true);
                        setIsAllPositionsEnabled(!isAllPositionsEnabled);
                    }}
                    Width={36}
                    id='positions_only_toggle'
                />
            </div>
        </span>
    );

    const tabData = [
        { title: 'Positions', id: 'tab1' },
        { title: 'Limit Orders', id: 'tab2' },
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
                <div className={styles.option_toggles}>{positionsOnlyToggle}</div>
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
