import styles from './SetInitialLiquidity.module.css';
import { motion } from 'framer-motion';
import { TokenIF } from '../../../utils/interfaces/exports';
import Toggle2 from '../../Global/Toggle/Toggle2';
import { useState } from 'react';
interface SetInitialLiquidityPropsIF {
    animation: {
        initial: {
            opacity: number;
            x: number;
        };
        animate: {
            opacity: number;
            x: number;
        };
        exit: {
            opacity: number;
            x: number;
        };
    };
    tokenA: TokenIF;
    tokenB: TokenIF;
}

interface TokenAndLiquidityPropsIF {
    token: TokenIF;
}
function TokenAndLiquidityDisplay(props: TokenAndLiquidityPropsIF) {
    const { token } = props;

    return (
        <div className={styles.token_liquidity_container}>
            <div className={styles.token_liquidity_content}>
                <div className={styles.token}>
                    <img src={token.logoURI} alt='base token' />
                    <p>{token.symbol}</p>
                </div>
                <div className={styles.liquidity}>
                    <input type='text' placeholder='0.00' />
                    <span>%</span>
                </div>
            </div>
            <p className={styles.balance}>Balance: 0</p>
        </div>
    );
}
export default function SetInitialLiquidity(props: SetInitialLiquidityPropsIF) {
    const { animation, tokenA, tokenB } = props;
    const [optimizeLiquidity, setOptimizeLiquidity] = useState(false);

    const optimizeLiquidityDisplay = (
        <div className={styles.optimize_liquidity_container}>
            <p>Auto optimize liquidity</p>
            <Toggle2
                id='optimize_liquidity'
                isOn={optimizeLiquidity}
                handleToggle={() => setOptimizeLiquidity(true)}
            />
        </div>
    );

    const totalDisplay = (
        <div className={styles.total_display}>
            <div className={styles.row}>
                <p>Total</p>
                <span>$0.00</span>
            </div>
            <div className={styles.row}>
                <p>
                    Available: $0.00 <button>Max</button>
                </p>
                <button>Optimize</button>
            </div>
        </div>
    );

    return (
        <motion.div
            variants={animation}
            initial='initial'
            animate='animate'
            exit='exit'
            transition={{ duration: 0.2 }}
            className={styles.main_container}
        >
            <TokenAndLiquidityDisplay token={tokenA} />
            <TokenAndLiquidityDisplay token={tokenB} />
            {optimizeLiquidityDisplay}
            {totalDisplay}
        </motion.div>
    );
}
