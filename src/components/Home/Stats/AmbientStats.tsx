import { useContext, useEffect, useState } from 'react';
import { getFormattedNumber } from '../../../App/functions/getFormattedNumber';
import { getChainStats } from '../../../App/functions/getPoolStats';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { CachedDataContext } from '../../../contexts/CachedDataContext';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { Fade } from 'react-reveal';
import {
    HomeContent,
    HomeTitle,
    StatContainer,
    StatCardContainer,
    StatValue,
} from '../../../styled/Components/Home';

interface StatCardProps {
    title: string;
    value: string | number;
}

function StatCard(props: StatCardProps) {
    const { title, value } = props;
    const ariaDescription = `${title} is ${value}`;
    return (
        <StatCardContainer
            flexDirection='column'
            justifyContent='center'
            gap={8}
            alignItems='center'
            background='dark2'
            aria-label={ariaDescription}
            tabIndex={0}
        >
            <HomeTitle style={{ fontWeight: '100' }}>{title}</HomeTitle>
            <StatValue
                fontWeight='300'
                fontSize='header2'
                color='text1'
                font='mono'
            >
                {value}
            </StatValue>
        </StatCardContainer>
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
                        getFormattedNumber({
                            value: dexStats.tvlTotalUsd,
                            prefix: '$',
                            isTvl: true,
                        }),
                    );
                    setTotalVolumeString(
                        getFormattedNumber({
                            value: dexStats.volumeTotalUsd,
                            prefix: '$',
                        }),
                    );
                    setTotalFeesString(
                        getFormattedNumber({
                            value: dexStats.feesTotalUsd,
                            prefix: '$',
                        }),
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
            <HomeTitle aria-label='Ambient Finance Stats' tabIndex={0}>
                Ambient Finance Stats
            </HomeTitle>
            <HomeContent>
                {statCardData.map((card, idx) => (
                    <StatCard key={idx} title={card.title} value={card.value} />
                ))}
            </HomeContent>
        </Fade>
    );

    return (
        <StatContainer flexDirection='column' gap={16} padding='16px 0'>
            {showMobileVersion ? (
                mobileWrapper
            ) : (
                <>
                    <HomeTitle aria-label='Ambient Finance Stats' tabIndex={0}>
                        Ambient Finance Stats
                    </HomeTitle>
                    <HomeContent>
                        {statCardData.map((card, idx) => (
                            <StatCard
                                key={idx}
                                title={card.title}
                                value={card.value}
                            />
                        ))}
                    </HomeContent>
                </>
            )}
        </StatContainer>
    );
}
