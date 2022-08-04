import styles from './PortfolioTabs.module.css';
import { useEffect, useState } from 'react';
import TabContent from '../../Global/Tabs/TabContent/TabContent';
import TabNavItem from '../../Global/Tabs/TabNavItem/TabNavItem';
import Wallet from '../../Global/Account/AccountTabs/Wallet/Wallet';
import Exchange from '../../Global/Account/AccountTabs/Exchange/Exchange';
import Range from '../../Global/Account/AccountTabs/Range/Range';
import Order from '../../Global/Account/AccountTabs/Order/Order';
import TransactionsTable from '../../Global/Account/AccountTabs/Transaction/TransactionsTable';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { getPositionData } from '../../../App/functions/getPositionData';
import { PositionIF } from '../../../utils/interfaces/PositionIF';

// import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
// import Wallet from '../../Global/Account/Wallet/Wallet';
// import Exchange from '../../Global/Account/Exchange/Exchange';
// import Range from '../../Global/Account/Range/Range';
// import Order from '../../Global/Account/Order/Order';
// import TransactionsTable from '../../Global/Account/Transaction/TransactionsTable';
interface PortfolioTabsPropsIF {
    resolvedAddress: string;
    activeAccount: string;
    connectedAccountActive: boolean;
    chainId: string;
}
export default function PortfolioTabs(props: PortfolioTabsPropsIF) {
    const { resolvedAddress, activeAccount, connectedAccountActive, chainId } = props;
    const [activeTab, setActiveTab] = useState('tab1');
    const graphData = useAppSelector((state) => state?.graphData);
    const connectedAccountPositionData = graphData.positionsByUser.positions;
    const [otherAccountPositionData, setOtherAccountPositionData] = useState<PositionIF[]>([]);

    const httpGraphCacheServerDomain = 'https://809821320828123.de:5000';

    const allUserPositionsCacheEndpoint = httpGraphCacheServerDomain + '/user_positions?';

    const getUserPositions = async (accountToSearch: string) =>
        fetch(
            allUserPositionsCacheEndpoint +
                new URLSearchParams({
                    user: accountToSearch,
                    chainId: chainId,
                }),
        )
            .then((response) => response?.json())
            .then((json) => {
                const userPositions = json?.data;

                if (userPositions) {
                    Promise.all(userPositions.map(getPositionData)).then((updatedPositions) => {
                        setOtherAccountPositionData(updatedPositions);
                    });
                }
            })
            .catch(console.log);

    useEffect(() => {
        (async () => {
            if (!connectedAccountActive) {
                await getUserPositions(activeAccount);
            }
        })();
    }, [activeAccount, connectedAccountActive]);

    const activeAccountPositionData = connectedAccountActive
        ? connectedAccountPositionData
        : otherAccountPositionData;

    const tabData = [
        { title: 'Wallet', id: 'tab1' },
        { title: 'Exchange', id: 'tab2' },
        { title: 'Ranges', id: 'tab3' },
        { title: ' Orders', id: 'tab4' },
        { title: 'Transactions', id: 'tab5' },
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
                {/* <div className={styles.option_toggles}>{positionsOnlyToggle}</div> */}
            </div>
            <div className={styles.tabs_outlet}>
                <TabContent id='tab1' activeTab={activeTab}>
                    <Wallet
                        connectedAccountActive={connectedAccountActive}
                        resolvedAddress={resolvedAddress}
                        activeAccount={activeAccount}
                        chainId={chainId}
                    />
                </TabContent>
                <TabContent id='tab2' activeTab={activeTab}>
                    <Exchange />
                </TabContent>
                <TabContent id='tab3' activeTab={activeTab}>
                    <Range positions={activeAccountPositionData} />
                </TabContent>
                <TabContent id='tab4' activeTab={activeTab}>
                    <Order />
                </TabContent>
                <TabContent id='tab5' activeTab={activeTab}>
                    <TransactionsTable />
                </TabContent>
            </div>
        </div>
    );
}
