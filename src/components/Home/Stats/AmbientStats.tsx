import { useContext, useEffect, useMemo, useState } from 'react';
import {
    getChainStats,
    getFormattedNumber,
} from '../../../ambient-utils/dataLayer';
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
    GCGO_BLAST_URL,
    GCGO_ETHEREUM_URL,
    GCGO_SCROLL_URL,
    IS_LOCAL_ENV,
} from '../../../ambient-utils/constants';
import { CrocEnv } from '@crocswap-libs/sdk';
import { TokenContext } from '../../../contexts/TokenContext';

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
    const { mainnetProvider, scrollProvider, blastProvider } =
        useContext(CrocEnvContext);
    const { tokens } = useContext(TokenContext);
    const allDefaultTokens = tokens.allDefaultTokens;

    const mainnetCrocEnv = useMemo(
        () =>
            mainnetProvider
                ? new CrocEnv(mainnetProvider, undefined)
                : undefined,
        [mainnetProvider !== undefined],
    );

    const scrollCrocEnv = useMemo(
        () =>
            scrollProvider ? new CrocEnv(scrollProvider, undefined) : undefined,
        [scrollProvider !== undefined],
    );

    const blastCrocEnv = useMemo(
        () =>
            blastProvider ? new CrocEnv(blastProvider, undefined) : undefined,
        [blastProvider !== undefined],
    );

    const { cachedFetchTokenPrice } = useContext(CachedDataContext);

    const [totalTvlString, setTotalTvlString] = useState<string | undefined>();
    const [totalVolumeString, setTotalVolumeString] = useState<
        string | undefined
    >();
    const [totalFeesString, setTotalFeesString] = useState<
        string | undefined
    >();

    useEffect(() => {
        if (
            mainnetCrocEnv !== undefined &&
            scrollCrocEnv !== undefined &&
            blastCrocEnv !== undefined &&
            allDefaultTokens.length > 0
        ) {
            let tvlTotalUsd = 0,
                volumeTotalUsd = 0,
                feesTotalUsd = 0;

            const numChainsToAggregate = 3;
            let resultsReceived = 0;

            getChainStats(
                'cumulative',
                '0x1',
                mainnetCrocEnv,
                GCGO_ETHEREUM_URL,
                cachedFetchTokenPrice,
                15,
                allDefaultTokens,
            ).then((dexStats) => {
                if (!dexStats) {
                    return;
                }
                tvlTotalUsd += dexStats.tvlTotalUsd;
                volumeTotalUsd += dexStats.volumeTotalUsd;
                feesTotalUsd += dexStats.feesTotalUsd;

                resultsReceived += 1;
                IS_LOCAL_ENV &&
                    console.log(
                        'mainnet cumulative vol: ',
                        dexStats.volumeTotalUsd.toLocaleString(),
                    );

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
                'cumulative',
                '0x82750',
                scrollCrocEnv,
                GCGO_SCROLL_URL,
                cachedFetchTokenPrice,
                15,
                allDefaultTokens,
            ).then((dexStats) => {
                if (!dexStats) {
                    return;
                }
                tvlTotalUsd += dexStats.tvlTotalUsd;
                volumeTotalUsd += dexStats.volumeTotalUsd;
                feesTotalUsd += dexStats.feesTotalUsd;
                resultsReceived += 1;
                IS_LOCAL_ENV &&
                    console.log(
                        'scroll cumulative vol: ',
                        dexStats.volumeTotalUsd.toLocaleString(),
                    );

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
                'cumulative',
                '0x13e31',
                blastCrocEnv,
                GCGO_BLAST_URL,
                cachedFetchTokenPrice,
                15,
                allDefaultTokens,
            ).then((dexStats) => {
                if (!dexStats) {
                    return;
                }
                tvlTotalUsd += dexStats.tvlTotalUsd;
                volumeTotalUsd += dexStats.volumeTotalUsd;
                feesTotalUsd += dexStats.feesTotalUsd;
                resultsReceived += 1;
                IS_LOCAL_ENV &&
                    console.log(
                        'blast cumulative vol: ',
                        dexStats.volumeTotalUsd.toLocaleString(),
                    );
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
    }, [
        mainnetCrocEnv !== undefined &&
            scrollCrocEnv !== undefined &&
            blastCrocEnv !== undefined &&
            allDefaultTokens.length > 0,
    ]);

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

    const statsTitle = 'Ambient Finance Stats';

    const mobileWrapper = (
        <Fade up>
            <HomeTitle aria-label={statsTitle} tabIndex={0}>
                {statsTitle}
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
                    <HomeTitle aria-label={statsTitle} tabIndex={0}>
                        {statsTitle}
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
