import { useContext, useEffect, useState } from 'react';
import {
    getChainStats,
    getFormattedNumber,
} from '../../../ambient-utils/dataLayer';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { CachedDataContext } from '../../../contexts/CachedDataContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { Fade } from 'react-reveal';
import {
    HomeContent,
    HomeTitle,
    StatContainer,
    StatCardContainer,
    StatValue,
} from '../../../styled/Components/Home';
import {
    GCGO_ETHEREUM_URL,
    GCGO_SCROLL_URL,
} from '../../../ambient-utils/constants';
import { CrocEnv } from '@crocswap-libs/sdk';
import { useProvider } from 'wagmi';

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
    const { mainnetProvider } = useContext(CrocEnvContext);
    const scrollProvider = useProvider({ chainId: +'0x82750' });

    const { cachedFetchTokenPrice } = useContext(CachedDataContext);

    const [totalTvlString, setTotalTvlString] = useState<string | undefined>();
    const [totalVolumeString, setTotalVolumeString] = useState<
        string | undefined
    >();
    const [totalFeesString, setTotalFeesString] = useState<
        string | undefined
    >();

    useEffect(() => {
        if (isServerEnabled) {
            const mainnetCrocEnv = mainnetProvider
                ? new CrocEnv(mainnetProvider, undefined)
                : undefined;

            const scrollCrocEnv = scrollProvider
                ? new CrocEnv(scrollProvider, undefined)
                : undefined;

            let tvlTotalUsd = 0,
                volumeTotalUsd = 0,
                feesTotalUsd = 0;

            const numChainsToAggregate = 2; // currently only Mainnet and Scroll
            let resultsReceived = 0;

            if (!mainnetCrocEnv || !scrollCrocEnv) return;
            getChainStats(
                '0x1',
                mainnetCrocEnv,
                GCGO_ETHEREUM_URL,
                cachedFetchTokenPrice,
            ).then((dexStats) => {
                if (!dexStats) {
                    return;
                }
                tvlTotalUsd += dexStats.tvlTotalUsd;
                volumeTotalUsd += dexStats.volumeTotalUsd;
                feesTotalUsd += dexStats.feesTotalUsd;

                resultsReceived += 1;

                if (resultsReceived === numChainsToAggregate) {
                    setTotalTvlString(
                        getFormattedNumber({
                            value: tvlTotalUsd,
                            prefix: '$',
                            isTvl: true,
                        }),
                    );
                    setTotalVolumeString(
                        getFormattedNumber({
                            value: volumeTotalUsd,
                            prefix: '$',
                        }),
                    );
                    setTotalFeesString(
                        getFormattedNumber({
                            value: feesTotalUsd,
                            prefix: '$',
                        }),
                    );
                }
            });

            getChainStats(
                '0x82750',
                scrollCrocEnv,
                GCGO_SCROLL_URL,
                cachedFetchTokenPrice,
            ).then((dexStats) => {
                if (!dexStats) {
                    return;
                }
                tvlTotalUsd += dexStats.tvlTotalUsd;
                volumeTotalUsd += dexStats.volumeTotalUsd;
                feesTotalUsd += dexStats.feesTotalUsd;
                resultsReceived += 1;
                if (resultsReceived === numChainsToAggregate) {
                    setTotalTvlString(
                        getFormattedNumber({
                            value: tvlTotalUsd,
                            prefix: '$',
                            isTvl: true,
                        }),
                    );
                    setTotalVolumeString(
                        getFormattedNumber({
                            value: volumeTotalUsd,
                            prefix: '$',
                        }),
                    );
                    setTotalFeesString(
                        getFormattedNumber({
                            value: feesTotalUsd,
                            prefix: '$',
                        }),
                    );
                }
            });
        }
    }, [mainnetProvider !== undefined && scrollProvider !== undefined]);

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
