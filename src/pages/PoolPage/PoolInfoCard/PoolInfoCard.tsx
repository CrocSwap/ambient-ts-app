import Divider from '../../../components/Global/Divider/Divider';
import { PoolData } from '../../../state/pools/reducer';
import { isAddress } from '../../../utils';
import { formatAmount, formatDollarAmount } from '../../../utils/numbers';
import styles from './PoolInfoCard.module.css';
interface poolProps {
    pool?: PoolData;
}

interface InfoCardProps {
    title: string;
    body: string | number;
    info?: number;
}

export default function PoolInfoCard(props: poolProps) {
    const pool = props.pool;
    function getPoolLogoURL(address?: string) {
        const checkSummed = isAddress(address);
        return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${checkSummed}/logo.png`;
    }
    function InfoCard(props: InfoCardProps) {
        const { title, body, info } = props;

        return (
            <>
                <div className={styles.title}>{title}</div>
                <div className={styles.body}>{body}</div>
                <div className={styles.body}>
                    {info ? (
                        <label className={info < 0 ? styles.lowPriceChange : styles.apy}>
                            {info.toFixed(2)}%
                        </label>
                    ) : (
                        <></>
                    )}
                </div>
            </>
        );
    }

    const totalTokensLocked = (
        <div className={styles.totalTokensLocked}>
            <div className={styles.dbhmjy}>
                <label className={styles.totalTokensLockedText}>Total Tokens Locked</label>
                <div className={styles.tokenLockedRow}>
                    <div className={styles.tokenImageWithName}>
                        <img
                            className={styles.tokenImage}
                            src={getPoolLogoURL(pool?.token0.address)}
                            onError={({ currentTarget }) => {
                                currentTarget.onerror = null;
                                currentTarget.src = '/question.svg';
                            }}
                            alt='pool'
                            width='30px'
                        />
                        <label className={styles.tokenName}>{pool?.token0.symbol}</label>
                    </div>
                    <label className={styles.tokenName}>{formatAmount(pool?.tvlToken0)}</label>
                </div>
                <div className={styles.tokenLockedRow}>
                    <div className={styles.tokenImageWithName}>
                        <img
                            className={styles.tokenImage}
                            src={getPoolLogoURL(pool?.token1.address)}
                            onError={({ currentTarget }) => {
                                currentTarget.onerror = null;
                                currentTarget.src = '/question.svg';
                            }}
                            alt='pool'
                            width='30px'
                        />
                        <label className={styles.tokenName}>{pool?.token1.symbol}</label>
                    </div>
                    <label className={styles.tokenName}>{formatAmount(pool?.tvlToken1)}</label>
                </div>
            </div>
        </div>
    );
    const poolDataCard = (
        <div className={styles.cqwlBw}>
            {pool ? (
                <>
                    {totalTokensLocked}
                    <InfoCard
                        title='TVL'
                        body={formatDollarAmount(pool.tvlUSD)}
                        info={Math.abs(pool.tvlUSDChange)}
                    />
                    <Divider />
                    <InfoCard
                        title='Volume 24h'
                        body={formatDollarAmount(pool.volumeUSD)}
                        info={Math.abs(pool.volumeUSDChange)}
                    />
                    <Divider />
                    <InfoCard
                        title='24h Fees'
                        body={formatDollarAmount(pool.volumeUSD * (pool.feeTier / 1000000))}
                    />
                </>
            ) : (
                <></>
            )}
            {/* </div> */}
        </div>
    );

    return <>{poolDataCard}</>;
}
