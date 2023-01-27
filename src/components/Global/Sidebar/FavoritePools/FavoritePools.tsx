import styles from './FavoritePools.module.css';
import FavoritePoolsCard from './FavoritePoolsCard';
import { PoolIF, TokenIF } from '../../../../utils/interfaces/exports';
import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';

interface propsIF {
    favePools: PoolIF[];
    lastBlockNumber: number;
    cachedPoolStatsFetch: PoolStatsFn;
    addPoolToFaves: (tokenA: TokenIF, tokenB: TokenIF, chainId: string, poolId: number) => void;
    removePoolFromFaves: (
        tokenA: TokenIF,
        tokenB: TokenIF,
        chainId: string,
        poolId: number,
    ) => void;
    chainId: string;
}

export default function FavoritePools(props: propsIF) {
    const {
        favePools,
        lastBlockNumber,
        cachedPoolStatsFetch,
        addPoolToFaves,
        // removePoolFromFaves,
        chainId,
    } = props;

    const { tradeData } = useAppSelector((state) => state);

    const isAlreadyFavorited = favePools?.some(
        (pool: PoolIF) =>
            pool.base.address === tradeData.baseToken.address &&
            pool.quote.address === tradeData.quoteToken.address &&
            pool.poolId === 36000 &&
            pool.chainId.toString() === chainId,
    );

    const handleFavButton = () =>
        addPoolToFaves(tradeData.baseToken, tradeData.quoteToken, chainId, 36000);

    const addCurrentPoolLinkOrNull = isAlreadyFavorited ? null : (
        <div className={styles.view_more} onClick={handleFavButton}>
            Add Current Pool
        </div>
    );

    // TODO:   @Junior  please refactor the header <div> as a <header> element

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>Pool</div>
                <div>Volume</div>
                <div>TVL</div>
            </div>
            {addCurrentPoolLinkOrNull}
            <div className={styles.content}>
                {favePools.map((pool, idx) => (
                    <FavoritePoolsCard
                        key={idx}
                        pool={pool}
                        cachedPoolStatsFetch={cachedPoolStatsFetch}
                        lastBlockNumber={lastBlockNumber}
                    />
                ))}
            </div>
        </div>
    );
}
