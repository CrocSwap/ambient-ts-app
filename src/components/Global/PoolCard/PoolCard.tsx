import styles from './PoolCard.module.css';
import { motion } from 'framer-motion';
interface PoolCardProps {
    onClick: () => void;
    isSelected: boolean;
    speed: number;
}
const spring = {
    type: 'spring',
    stiffness: 500,
    damping: 30,
};

export default function PoolCard(props: PoolCardProps) {
    const { isSelected, onClick } = props;

    return (
        <motion.div className={styles.pool_card} onMouseEnter={onClick}>
            <div className={styles.row}>
                <div>
                    <img
                        src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png'
                        alt=''
                    />
                    <img
                        src='https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png'
                        alt=''
                    />
                </div>
                <div className={styles.tokens_name}>ETH / USDC</div>
            </div>

            <div className={styles.row}>
                <div></div>
                <div>
                    <div className={styles.row_title}>APY</div>
                    <div className={styles.apy}>35.68%</div>
                </div>
            </div>
            <div className={styles.row}>
                <div></div>
                <div>
                    <div className={styles.row_title}>Vol.</div>
                    <div className={styles.vol}>$62m</div>
                </div>
            </div>

            <div className={styles.row}>
                <div className={styles.price}>$2,681.00</div>
                <div>
                    <div className={styles.row_title}>24h</div>
                    <div className={styles.hours}>1.54%</div>
                </div>
            </div>
            {isSelected && (
                <motion.div
                    layoutId='outline'
                    className={styles.outline}
                    initial={false}
                    animate={{ borderColor: 'red' }}
                    transition={spring}
                />
            )}
        </motion.div>
    );
}
