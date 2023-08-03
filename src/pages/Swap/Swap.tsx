import { memo, useContext } from 'react';
import { PoolNotInitalized } from '../../components/PoolNotInitialized/PoolNotInitialized';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import SwapComponent from '../Trade/Swap/Swap';
import styles from './Swap.module.css';
import ContentContainer from '../../components/Global/ContentContainer/ContentContainer';
import TradeModuleHeader from '../../components/Trade/TradeModules/TradeModuleHeader';
import { UserPreferenceContext } from '../../contexts/UserPreferenceContext';

function Swap() {
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { tokenA, tokenB } = useAppSelector((state) => state.tradeData);
    // const { isPoolInitialized } = useContext(PoolContext);

    const isPoolInitialized = false;
    const { swapSlippage, bypassConfirmSwap } = useContext(
        UserPreferenceContext,
    );
    return (
        <div className={styles.swap_page_container}>
            {isPoolInitialized === false && (
                <ContentContainer>
                    <TradeModuleHeader
                        slippage={swapSlippage}
                        bypassConfirm={bypassConfirmSwap}
                        settingsTitle='Swap'
                        isSwapPage={true}
                    />
                    <PoolNotInitalized
                        chainId={chainId}
                        tokenA={tokenA}
                        tokenB={tokenB}
                    />
                </ContentContainer>
            )}
            {isPoolInitialized && <SwapComponent />}
        </div>
    );
}

export default memo(Swap);
