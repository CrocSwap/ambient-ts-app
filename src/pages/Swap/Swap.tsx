import { memo, useContext } from 'react';
import { PoolNotInitalized } from '../../components/PoolNotInitialized/PoolNotInitialized';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { PoolContext } from '../../contexts/PoolContext';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import SwapComponent from '../Trade/Swap/Swap';
import styles from './Swap.module.css';

function Swap() {
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { tokenA, tokenB } = useAppSelector((state) => state.tradeData);
    const { isPoolInitialized } = useContext(PoolContext);

    return (
        <div className={styles.swap_page_container}>
            {!isPoolInitialized && (
                <PoolNotInitalized
                    chainId={chainId}
                    tokenA={tokenA}
                    tokenB={tokenB}
                />
            )}
            <SwapComponent />
        </div>
    );
}

export default memo(Swap);
