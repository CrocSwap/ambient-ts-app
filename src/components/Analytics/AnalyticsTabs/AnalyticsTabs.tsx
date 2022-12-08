/* eslint-disable @typescript-eslint/no-explicit-any */
import styles from './AnalyticsTabs.module.css';
import { useMemo, SetStateAction, Dispatch, useState } from 'react';
// import Positions from '../../Trade/TradeTabs/Positions/Positions';
import TopTokens from '../../TopTokens/TopTokens';
import Pools from '../../Pools/Pools';
import TopRanges from '../../TopRanges/TopRanges';
import { notEmpty } from '../../../utils';
import TabComponent from '../../Global/TabComponent/TabComponent';
import { PoolIF } from '../../../utils/interfaces/PoolIF';
import { TokenIF } from '../../../utils/interfaces/TokenIF';
import { BiSearch } from 'react-icons/bi';
// import { useAppSelector } from '../../../utils/hooks/reduxToolkit';

interface AnalyticsProps {
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    favePools: PoolIF[];
    addPoolToFaves: (tokenA: TokenIF, tokenB: TokenIF, chainId: string, poolId: number) => void;
    removePoolFromFaves: (
        tokenA: TokenIF,
        tokenB: TokenIF,
        chainId: string,
        poolId: number,
    ) => void;
}
export default function AnalyticsTabs(props: AnalyticsProps) {
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
                    favePools={props.favePools}
                    removePoolFromFaves={props.removePoolFromFaves}
                    addPoolToFaves={props.addPoolToFaves}
                />
            ),
        },
        {
            label: 'Trending Pools',
            content: (
                <Pools
                    poolType='trend'
                    pools={searchWord.length > 0 ? pools : poolsResult}
                    favePools={props.favePools}
                    removePoolFromFaves={props.removePoolFromFaves}
                    addPoolToFaves={props.addPoolToFaves}
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
                setOutsideControl={props.setOutsideControl}
                setSelectedOutsideTab={props.setSelectedOutsideTab}
            />
        </div>
    );
}
