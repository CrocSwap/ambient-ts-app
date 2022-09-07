import styles from './AnalyticsTabs.module.css';
import { useMemo, useState, SetStateAction, Dispatch } from 'react';
// import Positions from '../../Trade/TradeTabs/Positions/Positions';
import TopTokens from '../../TopTokens/TopTokens';
import Pools from '../../Pools/Pools';
import TopRanges from '../../TopRanges/TopRanges';
import { useAllTokenData } from '../../../state/tokens/hooks';
import { notEmpty } from '../../../utils';
import { useAllPoolData } from '../../../state/pools/hooks';
import { TokenData } from '../../../state/tokens/models';
import { PoolData } from '../../../state/pools/models';
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
                rightTabOptions={false}
                selectedOutsideTab={0}
                outsideControl={false}
                setOutsideControl={props.setOutsideControl}
                setSelectedOutsideTab={props.setSelectedOutsideTab}
                // search={search}
            />
        </div>
    );
}
