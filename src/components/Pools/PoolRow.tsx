import { useNavigate } from 'react-router-dom';
import { PoolData } from '../../state/pools/models';
import { feeTierPercent, isAddress } from '../../utils';
import { useAppDispatch } from '../../utils/hooks/reduxToolkit';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { formatDollarAmount } from '../../utils/numbers';
import { setTokenA, setTokenB } from '../../utils/state/tradeDataSlice';
import PoolDisplay from '../Global/Analytics/PoolDisplay';
import TokenDisplay from '../Global/Analytics/TokenDisplay';
import Apy from '../Global/Tabs/Apy/Apy';
import styles from './PoolRow.module.css';
import favouritePoolsImage from '../../assets/images/sidebarImages/favouritePools.svg';

interface PoolProps {
    pool: PoolData;
    poolType: string;
}

export default function PoolRow(props: PoolProps) {
    const poolData = props.pool;
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

    return (
        <div className={styles.main_container} onClick={handleRowClick}>
            <div>{favouritePoolsImage}</div>

            <div className={styles.tokens_container}>
                <TokenDisplay
                    token0={isAddress(poolData.token0.address)}
                    token1={isAddress(poolData.token1.address)}
                />
            </div>

            <div className={styles.row_container}>
                <PoolDisplay token0={poolData.token0.symbol} token1={poolData.token1.symbol} />
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
                        className={props.poolType === 'trend' ? styles.feeTierHide : styles.display}
                    >
                        {feeTierPercent(poolData.feeTier)}
                    </section>
                </>

                <Apy amount={50} />
            </div>

            <div className={styles.menu_container}>
                <section>
                    <button className={styles.trade_button} onClick={handleRowClick}>
                        Trade
                    </button>
                </section>
            </div>
        </div>
    );
}
