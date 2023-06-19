import styles from '../SidebarTable.module.css';
import FavoritePoolsCard from './FavoritePoolsCard';
import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { useContext } from 'react';
import { UserPreferenceContext } from '../../../../contexts/UserPreferenceContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { TokenPriceFn } from '../../../../App/functions/fetchTokenPrice';

interface propsIF {
    cachedPoolStatsFetch: PoolStatsFn;
    cachedFetchTokenPrice: TokenPriceFn;
}

export default function FavoritePools(props: propsIF) {
    const { cachedPoolStatsFetch } = props;

    const { tradeData } = useAppSelector((state) => state);
    const {
        chainData: { chainId, poolIndex: poolId },
    } = useContext(CrocEnvContext);
    const { favePools } = useContext(UserPreferenceContext);

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
                        pool={pool}
                        cachedPoolStatsFetch={cachedPoolStatsFetch}
                        cachedFetchTokenPrice={props.cachedFetchTokenPrice}
                    />
                ))}
            </div>
        </div>
    );
}
