import styles from './FavoritePools.module.css';
import FavoritePoolsCard from './FavoritePoolsCard';
import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { favePoolsMethodsIF } from '../../../../App/hooks/useFavePools';

interface propsIF {
    favePools: favePoolsMethodsIF;
    lastBlockNumber: number;
    cachedPoolStatsFetch: PoolStatsFn;
    chainId: string;
    poolId: number;
}

export default function FavoritePools(props: propsIF) {
    const {
        favePools,
        lastBlockNumber,
        cachedPoolStatsFetch,
        chainId,
        poolId,
    } = props;

    const { tradeData } = useAppSelector((state) => state);

    const isAlreadyFavorited = favePools.check(
        tradeData.baseToken.address,
        tradeData.quoteToken.address,
        chainId,
        poolId,
    );

    // TODO:   @Junior  please refactor the header <div> as a <header> element

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>Pool</div>
                <div>Volume</div>
                <div>TVL</div>
            </div>
            {isAlreadyFavorited || (
                <div
                    className={styles.view_more}
                    onClick={() =>
                        favePools.add(
                            tradeData.baseToken,
                            tradeData.quoteToken,
                            chainId,
                            poolId,
                        )
                    }
                >
                    Add Current Pool
                </div>
            )}
            <div className={styles.content}>
                {favePools.pools.map((pool, idx) => (
                    <FavoritePoolsCard
                        key={idx}
                        chainId={chainId}
                        pool={pool}
                        cachedPoolStatsFetch={cachedPoolStatsFetch}
                        lastBlockNumber={lastBlockNumber}
                    />
                ))}
            </div>
        </div>
    );
}
