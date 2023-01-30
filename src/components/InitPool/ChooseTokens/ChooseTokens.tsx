import styles from './ChooseTokens.module.css';
import { motion } from 'framer-motion';
import { TokenIF } from '../../../utils/interfaces/exports';
import { FiInfo } from 'react-icons/fi';

interface chooseTokensPropsIF {
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

interface TokenAndWeightPropsIF {
    token: TokenIF;
}
function TokenAndWeightDisplay(props: TokenAndWeightPropsIF) {
    const { token } = props;

    return (
        <div className={styles.token_weight_container}>
            <div className={styles.token}>
                <img src={token.logoURI} alt='base token' />
                <p>{token.symbol}</p>
            </div>
            <div className={styles.weight}>
                <input type='text' placeholder='50' value={50} />
                <span>%</span>
            </div>
        </div>
    );
}
export default function ChooseTokens(props: chooseTokensPropsIF) {
    const { tokenA, tokenB } = props;
    const { animation } = props;
    return (
        <motion.div
            variants={animation}
            initial='initial'
            animate='animate'
            exit='exit'
            transition={{ duration: 0.2 }}
        >
            <div className={styles.labels}>
                <p>Token</p>
                <p>Weight</p>
            </div>
            <div className={styles.tokens_weight_main_container}>
                <TokenAndWeightDisplay token={tokenA} />
                <TokenAndWeightDisplay token={tokenB} />
            </div>
            <div className={styles.total_allocated}>
                <p>Total allocated</p>
                <span>100%</span>
            </div>

            <div className={styles.extra_info}>
                <FiInfo size={35} />
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Labore nulla laborum
                    hic quaerat eaque necessitatibus minima cumque debitis sunt libero!
                </p>
            </div>
        </motion.div>
    );
}
