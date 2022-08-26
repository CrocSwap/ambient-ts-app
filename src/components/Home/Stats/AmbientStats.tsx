import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatAmount } from '../../../utils/numbers';
import styles from './Stats.module.css';

interface StatCardProps {
    title: string;
    value: string | number;
}

interface StatsProps {
    lastBlockNumber: number;
}
function StatCard(props: StatCardProps) {
    const { title, value } = props;

    return (
        <div className={styles.stat_card_container}>
            <div className={styles.title}>{title}</div>
            <div className={styles.value}>{value}</div>
        </div>
    );
}

const getDexStatsFresh = async () => {
    return fetch(
        'https://809821320828123.de:5000/dex_stats_fresh?' +
            new URLSearchParams({
                lookback: '9999999999999',
            }),
    )
        .then((response) => response?.json())
        .then((json) => {
            const dexStats = json?.data;
            return dexStats;
        })
        .catch(console.log);
};

export default function Stats(props: StatsProps) {
    const { lastBlockNumber } = props;

    const { t } = useTranslation();

    const [totalTvlString, setTotalTvlString] = useState<string | undefined>();
    const [totalVolumeString, setTotalVolumeString] = useState<string | undefined>();
    const [totalFeesString, setTotalFeesString] = useState<string | undefined>();

    useEffect(() => {
        getDexStatsFresh().then((dexStats) => {
            if (dexStats.tvl) setTotalTvlString('$' + formatAmount(dexStats.tvl));
            if (dexStats.volume) setTotalVolumeString('$' + formatAmount(dexStats.volume));
            if (dexStats.fees) setTotalFeesString('$' + formatAmount(dexStats.fees));
        });
    }, [lastBlockNumber]);

    const statCardData = [
        {
            title: 'Total Value Locked',
            value: totalTvlString ? totalTvlString : '…',
        },
        {
            title: 'Total Volume',
            value: totalVolumeString ? totalVolumeString : '…',
        },
        {
            title: 'Total Fees',
            value: totalFeesString ? totalFeesString : '…',
        },
    ];
    return (
        <div className={styles.container}>
            <div className={styles.title}>{t('homeStatsTitle')}</div>
            <div className={styles.content}>
                {statCardData.map((card, idx) => (
                    <StatCard key={idx} title={card.title} value={card.value} />
                ))}
            </div>
        </div>
    );
}
