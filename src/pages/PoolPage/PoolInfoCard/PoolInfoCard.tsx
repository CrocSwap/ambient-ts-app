import Divider from '../../../components/Global/Divider/Divider';
import { PoolData } from '../../../state/pools/reducer';
import { formatDollarAmount } from '../../../utils/numbers';
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
    function InfoCard(props: InfoCardProps) {
        const { title, body, info } = props;

        return (
            <div className={styles.link_card_container}>
                <div className={styles.title}>{title}</div>
                <div className={styles.body}>
                    {body}
                    {info ? (
                        <label className={info < 0 ? styles.lowPriceChange : styles.apy}>
                            {info.toFixed(2)}%
                        </label>
                    ) : (
                        <></>
                    )}
                </div>
            </div>
        );
    }

    const poolDataCard = (
        <div className={styles.pool_info_container}>
            <div className={styles.pool_info_window}>
                {pool ? (
                    <div className={styles.info_container}>
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
                    </div>
                ) : (
                    <></>
                )}
            </div>
        </div>
    );

    return <>{poolDataCard}</>;
}
