import styles from '../SidebarTable.module.css';
import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { useContext } from 'react';
import { UserPreferenceContext } from '../../../../contexts/UserPreferenceContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { TokenPriceFn } from '../../../../App/functions/fetchTokenPrice';
import PoolListItem from '../PoolListItem/PoolListItem';

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

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>Pool</div>
                <div>Volume</div>
                <div>TVL</div>
            </header>
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
                    <PoolListItem
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
