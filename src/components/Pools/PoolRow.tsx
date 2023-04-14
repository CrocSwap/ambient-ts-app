import { useNavigate } from 'react-router-dom';
import { feeTierPercent, isAddress } from '../../utils';
import { useAppDispatch } from '../../utils/hooks/reduxToolkit';
import { PoolIF, TokenIF } from '../../utils/interfaces/exports';
import { formatDollarAmount } from '../../utils/numbers';
import { setTokenA, setTokenB } from '../../utils/state/tradeDataSlice';
import PoolDisplay from '../Global/Analytics/PoolDisplay';
import TokenDisplay from '../Global/Analytics/TokenDisplay';
import Apy from '../Global/Tabs/Apy/Apy';
import styles from './PoolRow.module.css';
import { motion } from 'framer-motion';
import { MouseEvent } from 'react';
import { favePoolsMethodsIF } from '../../App/hooks/useFavePools';

interface propsIF {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pool: any;
    poolType: string;
    favePools: favePoolsMethodsIF;
}

export default function PoolRow(props: propsIF) {
    const { pool, favePools } = props;

    const poolData = pool;

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const token0 = {
        address: poolData.token0.address,
        name: poolData.token0.name,
        symbol: poolData.token0.symbol,
        logoURI: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${isAddress(
            poolData.token0.address,
        )}/logo.png`,
    } as TokenIF;
    const token1 = {
        address: poolData.token1.address,
        name: poolData.token1.name,
        symbol: poolData.token1.symbol,
        logoURI: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${isAddress(
            poolData.token1.address,
        )}/logo.png`,
    } as TokenIF;

    function handleRowClick() {
        dispatch(setTokenA(token0));
        dispatch(setTokenB(token1));
        navigate('/trade/market');
    }

    const isButtonFavorited = favePools.pools.some(
        (pool: PoolIF) =>
            pool.base.address === poolData.token0.address &&
            pool.quote.address === poolData.token1.address,
        // &&
        // pool.poolId === currentPoolData.poolId &&
        // pool.chainId.toString() === currentPoolData.chainId.toString(),
    );

    const handleFavButton = (event: MouseEvent<HTMLDivElement>) => {
        isButtonFavorited
            ? favePools.remove(
                  { address: poolData.token0.address } as TokenIF,
                  { address: poolData.token1.address } as TokenIF,
                  '',
                  pool.poolId,
              )
            : favePools.add(
                  { address: poolData.token0.address } as TokenIF,
                  { address: poolData.token1.address } as TokenIF,
                  '',
                  pool.poolId,
              );
        event.stopPropagation();
    };

    const favButton = (
        <motion.div
            className={styles.fab_button}
            whileTap={{ scale: 3 }}
            transition={{ duration: 0.5 }}
            onClick={handleFavButton}
            style={{
                cursor: 'pointer',
                textAlign: 'center',
            }}
        >
            <svg
                width='23'
                height='23'
                viewBox='0 0 23 23'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
            >
                <path
                    d='M11.5 1.58301L14.7187 8.10384L21.9166 9.15593L16.7083 14.2288L17.9375 21.3955L11.5 18.0101L5.06248 21.3955L6.29165 14.2288L1.08331 9.15593L8.28123 8.10384L11.5 1.58301Z'
                    stroke='#ebebff'
                    fill={isButtonFavorited ? '#ebebff' : 'none'}
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className={styles.star_svg}
                />
            </svg>
        </motion.div>
    );

    return (
        <div className={styles.main_container} onClick={handleRowClick}>
            <div>{favButton}</div>

            <div className={styles.tokens_container}>
                <TokenDisplay
                    token0={isAddress(poolData.token0.address)}
                    token1={isAddress(poolData.token1.address)}
                />
            </div>

            <div className={styles.row_container}>
                <PoolDisplay
                    token0={poolData.token0.symbol}
                    token1={poolData.token1.symbol}
                />
                <>
                    <section className={styles.display}>
                        {formatDollarAmount(poolData.tvlUSD)}
                    </section>
                </>

                <>
                    <section className={styles.display}>
                        {formatDollarAmount(poolData.volumeUSD)}
                    </section>
                </>

                <>
                    <section className={styles.display}>
                        {formatDollarAmount(poolData.volumeUSDWeek)}
                    </section>
                </>

                <>
                    <section
                        className={
                            props.poolType === 'trend'
                                ? styles.feeTierHide
                                : styles.display
                        }
                    >
                        {feeTierPercent(poolData.feeTier)}
                    </section>
                </>

                <Apy amount={50} />
            </div>
        </div>
    );
}
