import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { getChainStatsFresh } from '../../../utils/functions/getChainStats';
import { formatAmountOld } from '../../../utils/numbers';
import { userData } from '../../../utils/state/userDataSlice';
import styles from './Stats.module.css';

interface StatCardProps {
    title: string;
    value: string | number;
}

interface StatsProps {
    userData: userData;
    lastBlockNumber: number;
    chainId: string;
}

function StatCard(props: StatCardProps) {
    const { title, value } = props;
    const ariaDescription = `${title} is ${value}`;
    return (
        <li
            className={styles.stat_card_container}
            aria-label={ariaDescription}
            tabIndex={0}
        >
            <div className={styles.title}>{title}</div>
            <div className={styles.value}>{value}</div>
        </li>
    );
}

export default function Stats(props: StatsProps) {
    const { userData, lastBlockNumber, chainId } = props;
    const {
        server: { isEnabled: isServerEnabled },
    } = useContext(AppStateContext);

    const isUserIdle = userData.isUserIdle;

    const { t } = useTranslation();

    const [totalTvlString, setTotalTvlString] = useState<string | undefined>();
    const [totalVolumeString, setTotalVolumeString] = useState<
        string | undefined
    >();
    const [totalFeesString, setTotalFeesString] = useState<
        string | undefined
    >();

    useEffect(() => {
        if (isServerEnabled && !isUserIdle)
            getChainStatsFresh(chainId).then((dexStats) => {
                if (dexStats.tvl)
                    setTotalTvlString('$' + formatAmountOld(dexStats.tvl));
                if (dexStats.volume)
                    setTotalVolumeString(
                        '$' + formatAmountOld(dexStats.volume),
                    );
                if (dexStats.fees)
                    setTotalFeesString('$' + formatAmountOld(dexStats.fees));
            });
    }, [isServerEnabled, isUserIdle, lastBlockNumber]);

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
            <div
                className={styles.title}
                aria-label={t('homeStatsTitle')}
                tabIndex={0}
            >
                {t('homeStatsTitle')}
            </div>
            <ul className={styles.content}>
                {statCardData.map((card, idx) => (
                    <StatCard key={idx} title={card.title} value={card.value} />
                ))}
            </ul>
        </div>
    );
}
