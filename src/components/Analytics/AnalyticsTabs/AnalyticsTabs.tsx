/* eslint-disable @typescript-eslint/no-explicit-any */
import styles from './AnalyticsTabs.module.css';
import { useMemo, SetStateAction, Dispatch, useState } from 'react';
// import Positions from '../../Trade/TradeTabs/Positions/Positions';
import TopTokens from '../../TopTokens/TopTokens';
import Pools from '../../Pools/Pools';
import TopRanges from '../../TopRanges/TopRanges';
import { notEmpty } from '../../../utils';
import TabComponent from '../../Global/TabComponent/TabComponent';
import { BiSearch } from 'react-icons/bi';
import { favePoolsMethodsIF } from '../../../App/hooks/useFavePools';
// import { useAppSelector } from '../../../utils/hooks/reduxToolkit';

interface propsIF {
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    favePools: favePoolsMethodsIF;

}
export default function AnalyticsTabs(props: propsIF) {
    const {setSelectedOutsideTab, setOutsideControl, favePools} = props;

    const allTokens: any = [];
    const allPoolData: any = [];

    const [tokens, setTokens] = useState<any[]>([]);
    const [pools, setPools] = useState<any[]>([]);
    const [searchWord, setSearchWord] = useState('');

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

    const tokensResult = useMemo(() => {
        return Object.values(allTokens)
            .map((t: any) => t.data)
            .filter(notEmpty);
    }, [allTokens]);

    const poolsResult = useMemo(() => {
        return Object.values(allPoolData)
            .map((p: any) => p.data)
            .filter(notEmpty);
    }, [allPoolData]);

    const search = (value: string) => {
        setSearchWord(value);
        if (value.length > 0) {
            setTokens(
                tokensResult.filter(
                    (item) =>
                        item.name.toLowerCase().includes(value.toLowerCase()) ||
                        item.symbol.toLowerCase().includes(value.toLowerCase()) ||
                        item.address.toLowerCase().includes(value.toLowerCase()),
                ),
            );
            setPools(
                poolsResult.filter(
                    (item) =>
                        item.token0.name.toLowerCase().includes(value.toLowerCase()) ||
                        item.token1.name.toLowerCase().includes(value.toLowerCase()) ||
                        item.token0.symbol.toLowerCase().includes(value.toLowerCase()) ||
                        item.token1.symbol.toLowerCase().includes(value.toLowerCase()) ||
                        item.token0.address.toLowerCase().includes(value.toLowerCase()) ||
                        item.token1.address.toLowerCase().includes(value.toLowerCase()),
                ),
            );
        }
    };

    const analyticTabData = [
        {
            label: 'Top Tokens',
            content: <TopTokens tokens={searchWord.length > 0 ? tokens : tokensResult} />,
        },
        {
            label: 'Top Pools',
            content: (
                <Pools
                    poolType='top'
                    pools={searchWord.length > 0 ? pools : poolsResult}
                    favePools={favePools}
                />
            ),
        },
        {
            label: 'Trending Pools',
            content: (
                <Pools
                    poolType='trend'
                    pools={searchWord.length > 0 ? pools : poolsResult}
                    favePools={favePools}
                />
            ),
        },
        { label: 'Top Ranges', content: <TopRanges /> },
    ];

    return (
        <div className={styles.tabs_container}>
            <TabComponent
                data={analyticTabData}
                rightTabOptions={searchContainer}
                selectedOutsideTab={0}
                outsideControl={false}
                setOutsideControl={setOutsideControl}
                setSelectedOutsideTab={setSelectedOutsideTab}
            />
        </div>
    );
}
