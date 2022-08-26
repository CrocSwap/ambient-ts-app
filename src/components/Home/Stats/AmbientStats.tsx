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
    return fetch('https://809821320828123.de:5000/dex_stats_fresh')
        .then((response) => response?.json())
        .then((json) => {
            const dexStats = json?.data;
            return dexStats;
        })
        .catch(console.log);
};

// const randomTotalTVL = 1000000000000 * Math.random();
// const randomTotalVolume = 10000000000 * Math.random();
// const randomTotalFees = 100000000 * Math.random();

// const totalTvlString =
//     randomTotalTVL >= 10000000
//         ? formatAmount(randomTotalTVL)
//         : randomTotalTVL.toLocaleString(undefined, {
//               maximumFractionDigits: 0,
//           });

// const totalVolumeString =
//     randomTotalVolume >= 10000000
//         ? formatAmount(randomTotalVolume)
//         : randomTotalVolume.toLocaleString(undefined, {
//               maximumFractionDigits: 0,
//           });
// const totalFeesString =
//     randomTotalFees >= 10000000
//         ? formatAmount(randomTotalFees)
//         : randomTotalFees.toLocaleString(undefined, {
//               maximumFractionDigits: 0,
//           });

export default function Stats(props: StatsProps) {
    const { lastBlockNumber } = props;

    const { t } = useTranslation();

    const [totalTvlString, setTotalTvlString] = useState<string | undefined>();
    const [totalVolumeString, setTotalVolumeString] = useState<string | undefined>();
    const [totalFeesString, setTotalFeesString] = useState<string | undefined>();

    useEffect(() => {
        getDexStatsFresh().then((dexStats) => {
            console.log({ dexStats });
            if (dexStats.tvl) setTotalTvlString(formatAmount(dexStats.tvl));
            if (dexStats.volume) setTotalVolumeString(formatAmount(dexStats.volume));
            if (dexStats.fees) setTotalFeesString(formatAmount(dexStats.fees));
        });
    }, [lastBlockNumber]);

    const statCardData = [
        {
            title: 'Total TVL',
            value: `$${totalTvlString}`,
        },
        {
            title: 'Total Volume',
            value: `$${totalVolumeString}`,
        },
        {
            title: 'Total Fees',
            value: `$${totalFeesString}`,
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
