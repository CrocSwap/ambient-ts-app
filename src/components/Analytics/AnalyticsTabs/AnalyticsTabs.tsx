import styles from './AnalyticsTabs.module.css';
import { useState } from 'react';
import TabContent from '../../Global/Tabs/TabContent/TabContent';
import TabNavItem from '../../Global/Tabs/TabNavItem/TabNavItem';
import Positions from '../../Trade/Positions/Positions';
import { BiSearch } from 'react-icons/bi';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';

export default function AnalyticsTabs() {
    const [activeTab, setActiveTab] = useState('tab1');

    const graphData = useAppSelector((state) => state?.graphData);

    const tabData = [
        { title: 'Top Tokens', id: 'tab1' },
        { title: 'Top Pools', id: 'tab2' },
        { title: 'Trending Pools', id: 'tab3' },
        { title: 'Top Ranges', id: 'tab4' },
    ];

    const searchContainer = (
        <div className={styles.search_container}>
            <div className={styles.search_icon}>
                <BiSearch size={15} color='#bdbdbd' />
            </div>
            <input type='text' id='box' placeholder='Search...' className={styles.search__box} />
        </div>
    );

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
                <div className={styles.option_toggles}>{searchContainer}</div>
            </div>
            <div className={styles.tabs_outlet}>
                <TabContent id='tab1' activeTab={activeTab}>
                    <Positions
                        portfolio
                        isShowAllEnabled={false}
                        notOnTradeRoute={true}
                        graphData={graphData}
                        lastBlockNumber={0}
                        chainId={'0x0'} // Kludge to get React to compile... real chain data needs to be
                    />
                </TabContent>
                <TabContent id='tab2' activeTab={activeTab}>
                    {/* <p>Exchange Component</p> */}
                </TabContent>
                <TabContent id='tab3' activeTab={activeTab}>
                    {/* <p>Position component</p> */}
                </TabContent>
                <TabContent id='tab4' activeTab={activeTab}>
                    {/* <p>Limit Orders component</p> */}
                </TabContent>
            </div>
        </div>
    );
}
