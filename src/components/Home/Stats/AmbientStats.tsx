import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getChainStats } from '../../../App/functions/getPoolStats';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { CachedDataContext } from '../../../contexts/CachedDataContext';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { formatAmountOld } from '../../../utils/numbers';
import styles from './Stats.module.css';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { Fade } from 'react-reveal';

interface StatCardProps {
    title: string;
    value: string | number;
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
            <div className={styles.title} style={{ fontWeight: '100' }}>
                {title}
            </div>
            <div className={styles.value}>{value}</div>
        </li>
    );
}

export default function Stats() {
    const {
        server: { isEnabled: isServerEnabled },
    } = useContext(AppStateContext);
    const {
        chainData: { chainId },
        crocEnv,
    } = useContext(CrocEnvContext);

    const { cachedFetchTokenPrice } = useContext(CachedDataContext);
    const { lastBlockNumber } = useContext(ChainDataContext);

    const { isUserIdle } = useAppSelector((state) => state.userData);

    const { t } = useTranslation();

    const [totalTvlString, setTotalTvlString] = useState<string | undefined>();
    const [totalVolumeString, setTotalVolumeString] = useState<
        string | undefined
    >();
    const [totalFeesString, setTotalFeesString] = useState<
        string | undefined
    >();

    useEffect(() => {
        if (isServerEnabled && !isUserIdle && crocEnv) {
            getChainStats(chainId, crocEnv, cachedFetchTokenPrice).then(
                (dexStats) => {
                    if (!dexStats) {
                        return;
                    }

                    setTotalTvlString(
                        '$' + formatAmountOld(dexStats.tvlTotalUsd),
                    );
                    setTotalVolumeString(
                        '$' + formatAmountOld(dexStats.volumeTotalUsd),
                    );
                    setTotalFeesString(
                        '$' + formatAmountOld(dexStats.feesTotalUsd),
                    );
                },
            );
        }
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
    const showMobileVersion = useMediaQuery('(max-width: 600px)');

    const mobileWrapper = (
        <Fade up>
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
        </Fade>
    );

    return (
        <div className={styles.container}>
            {showMobileVersion ? (
                mobileWrapper
            ) : (
                <>
                    <div
                        className={styles.title}
                        aria-label={t('homeStatsTitle')}
                        tabIndex={0}
                    >
                        {t('homeStatsTitle')}
                    </div>
                    <ul className={styles.content}>
                        {statCardData.map((card, idx) => (
                            <StatCard
                                key={idx}
                                title={card.title}
                                value={card.value}
                            />
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}
