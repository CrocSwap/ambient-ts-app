import { TokenIF } from '../../../utils/interfaces/TokenIF';
import styles from './PoolCard.module.css';
interface PoolCardProps {
    onClick: () => void;
    name: string;
    tokenMap: Map<string, TokenIF>;
    tokenA: TokenIF;
    tokenB: TokenIF;
}

export default function PoolCard(props: PoolCardProps) {
    const { name, onClick, tokenMap, tokenA, tokenB } = props;

    const tokenAKey = tokenA?.address.toLowerCase() + '_0x' + tokenA?.chainId.toString();
    const tokenBKey = tokenB?.address.toLowerCase() + '_0x' + tokenB?.chainId.toString();

    const tokenAFromMap = tokenMap && tokenA?.address ? tokenMap.get(tokenAKey) : null;

    const tokenBFromMap = tokenMap && tokenB?.address ? tokenMap.get(tokenBKey) : null;

    return (
        <div className={styles.pool_card} onClick={onClick}>
            <div className={styles.row}>
                <div>
                    <img
                        src={tokenAFromMap?.logoURI}
                        // src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png'
                        alt=''
                    />
                    <img
                        src={tokenBFromMap?.logoURI}
                        // src='https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png'
                        alt=''
                    />
                </div>
                <div className={styles.tokens_name}>{name}</div>
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
        </div>
    );
}
