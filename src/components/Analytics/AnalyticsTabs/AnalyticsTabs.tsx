import styles from './AnalyticsTabs.module.css';
import { useMemo, useState } from 'react';
import TabContent from '../../Global/Tabs/TabContent/TabContent';
import TabNavItem from '../../Global/Tabs/TabNavItem/TabNavItem';
// import Positions from '../../Trade/TradeTabs/Positions/Positions';
import { BiSearch } from 'react-icons/bi';
import TopTokens from '../../TopTokens/TopTokens';
import Pools from '../../Pools/Pools';
import TopRanges from '../../TopRanges/TopRanges';
import { useAllTokenData } from '../../../state/tokens/hooks';
import { notEmpty } from '../../../utils';
import { useAllPoolData } from '../../../state/pools/hooks';
import { TokenData } from '../../../state/tokens/models';
import { PoolData } from '../../../state/pools/models';
// import { useAppSelector } from '../../../utils/hooks/reduxToolkit';

export default function AnalyticsTabs() {
    const [activeTab, setActiveTab] = useState('tab1');

    const tabData = [
        { title: 'Top Tokens', id: 'tab1' },
        { title: 'Top Pools', id: 'tab2' },
        { title: 'Trending Pools', id: 'tab3' },
        { title: 'Top Ranges', id: 'tab4' },
    ];

    const allTokens = useAllTokenData();
    const allPoolData = useAllPoolData();

    const [tokens, setTokens] = useState<TokenData[]>([]);
    const [pools, setPools] = useState<PoolData[]>([]);
    const [searchWord, setSearchWord] = useState('');

    const tokensResult = useMemo(() => {
        return Object.values(allTokens)
            .map((t) => t.data)
            .filter(notEmpty);
    }, [allTokens]);

    const poolsResult = useMemo(() => {
        return Object.values(allPoolData)
            .map((p) => p.data)
            .filter(notEmpty);
    }, [allPoolData]);

    const search = (value: string) => {
        setSearchWord(value);
        if (value.length > 0) {
            setTokens(
                tokensResult.filter((item) =>
                    item.name.toLowerCase().includes(value.toLowerCase()),
                ),
            );
            setPools(
                poolsResult.filter(
                    (item) =>
                        item.token0.name.toLowerCase().includes(value.toLowerCase()) ||
                        item.token1.name.toLowerCase().includes(value.toLowerCase()),
                ),
            );
        }
    };
    const searchContainer = (
        <div className={styles.search_container}>
            <div className={styles.search_icon}>
                <BiSearch size={20} color='#bdbdbd' />
            </div>
            <input
                type='text'
                id='box'
                style={{ height: 40 }}
                size={20}
                onChange={(e) => search(e.target.value)}
                placeholder='Search...'
                className={styles.search__box}
            />
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
                    <TopTokens tokens={searchWord.length > 0 ? tokens : tokensResult} />
                </TabContent>
                <TabContent id='tab2' activeTab={activeTab}>
                    <Pools pools={searchWord.length > 0 ? pools : poolsResult} propType='top' />
                </TabContent>
                <TabContent id='tab3' activeTab={activeTab}>
                    <Pools pools={searchWord.length > 0 ? pools : poolsResult} propType='trend' />
                </TabContent>
                <TabContent id='tab4' activeTab={activeTab}>
                    <TopRanges />
                </TabContent>
            </div>
        </div>
    );
}
