import styles from './TradeTabs.module.css';
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

export default function TradeTabs(props: ITabsProps) {
    const [activeTab, setActiveTab] = useState('tab1');
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
        <div className={styles.options_toggle}>
            <p>{isShowAllEnabled ? 'All ' + label : 'My ' + label}</p>

            <Toggle2
                isOn={isShowAllEnabled}
                handleToggle={() => {
                    setHasInitialized(true);
                    setIsShowAllEnabled(!isShowAllEnabled);
                }}
                id='positions_only_toggle'
                disabled={!props.isAuthenticated || !props.isWeb3Enabled}
            />
        </div>
    );

    const tabData = [
        { title: 'Ranges', id: 'tab1' },
        { title: 'Orders', id: 'tab2' },
        { title: 'Transactions', id: 'tab3' },
        { title: 'Leaderboard', id: 'tab4' },
        { title: 'Info', id: 'tab5' },
    ];
    // ----------------------------TAB DISPLAY ON DESKTOPS---------------------
    const desktopTabs = (
        <ul className={`${styles.tab_navs} ${styles.desktop_tabs}`}>
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
    );
    // ----------------------------END OF TAB DISPLAY ON DESKTOPS---------------------
    // spread operator is used to make a shallow copy  so we won't mutate the original data
    // We don't need to assign these to variables. We can simply use this in the return statement but it is cleaner to read this way.
    const firstTwoNavs = [...tabData].slice(0, 2);
    const remainingNavs = [...tabData].splice(2, tabData.length - 1);

    // ---------------------------MOBILE MENU DROPDOWWN-----------------------
    const mobileMenu = (
        <div className={styles.mobile_menus}>
            <DropdownMenu title={<BiDownArrow size={18} color='#bdbdbd' />}>
                <DropdownMenuContainer>
                    {remainingNavs.map((tab) => (
                        <DropdownMenuItem key={tab.title}>
                            <TabNavItem
                                key={tab.title}
                                title={tab.title}
                                id={tab.id}
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                            />
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContainer>
            </DropdownMenu>
        </div>
    );
    // ---------------------------END OF MOBILE MENU DROPDOWWN-----------------------

    // --------------------------- MOBILE TABS(FIRST TWO TABS)-----------------------
    const mobileTabs = (
        <ul className={`${styles.tab_navs} ${styles.mobile_tabs}`}>
            {firstTwoNavs.map((tab) => (
                <TabNavItem
                    key={tab.title}
                    title={tab.title}
                    id={tab.id}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
            ))}
        </ul>
    );

    // ---------------------------END OF MOBILE TABS(FIRST TWO TABS)-----------------------

    // FIRST TWO TABS PLUS DROPDOWN MEMU
    const mobileTabsDisplay = (
        <div className={styles.mobile_tabs_display}>
            {mobileTabs}
            {mobileMenu}
        </div>
    );

    return (
        <div className={styles.tabs_container}>
            <div className={styles.tabs}>
                {mobileTabsDisplay}
                {desktopTabs}

                {label ? positionsOnlyToggle : null}
            </div>
            <div className={styles.tabs_outlet}>
                <TabContent id='tab1' activeTab={activeTab}>
                    <Positions
                        isShowAllEnabled={isShowAllEnabled}
                        notOnTradeRoute={false}
                        graphData={graphData}
                        lastBlockNumber={props.lastBlockNumber}
                        chainId={props.chainId}
                    />
                </TabContent>

                <TabContent id='tab2' activeTab={activeTab}>
                    <Orders />
                </TabContent>
                <TabContent id='tab3' activeTab={activeTab}>
                    <Transactions
                        isShowAllEnabled={isShowAllEnabled}
                        graphData={graphData}
                        tokenMap={tokenMap}
                        chainId={props.chainId}
                    />
                </TabContent>
                <TabContent id='tab4' activeTab={activeTab}>
                    Leaderboard
                </TabContent>
                <TabContent id='tab5' activeTab={activeTab}>
                    Test of ranges refactor
                    <Ranges
                        isShowAllEnabled={isShowAllEnabled}
                        notOnTradeRoute={false}
                        graphData={graphData}
                        lastBlockNumber={props.lastBlockNumber}
                    />
                </TabContent>
            </div>
        </div>
    );
}
