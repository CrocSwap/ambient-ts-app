import styles from './AnalyticsTabs.module.css';
import { useMemo, useState } from 'react';
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
import TabComponent from '../../Global/TabComponent/TabComponent';
// import { useAppSelector } from '../../../utils/hooks/reduxToolkit';

export default function AnalyticsTabs() {
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

    const analyticTabData = [
        {
            label: 'Top Tokens',
            content: <TopTokens tokens={searchWord.length > 0 ? tokens : tokensResult} />,
        },
        {
            label: 'Top Pools',
            content: <Pools poolType='top' pools={searchWord.length > 0 ? pools : poolsResult} />,
        },
        {
            label: 'Trending Pools',
            content: <Pools poolType='trend' pools={searchWord.length > 0 ? pools : poolsResult} />,
        },
        { label: 'Top Ranges', content: <TopRanges /> },
    ];

    return (
        <div className={styles.tabs_container}>
            <div className={styles.option_toggles}>{searchContainer}</div>

            <TabComponent data={analyticTabData} rightTabOptions={false} />
        </div>
    );
}
