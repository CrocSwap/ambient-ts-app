import { useContext, useEffect, useState } from 'react';
import {
    getChainStats,
    getFormattedNumber,
    getSupportedChainIds,
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
    GCGO_BLAST_URL,
    GCGO_ETHEREUM_URL,
    GCGO_SCROLL_URL,
    IS_TESTNET_SITE,
} from '../../../ambient-utils/constants';
import { CrocEnv } from '@crocswap-libs/sdk';
import { useProvider } from 'wagmi';

interface StatCardProps {
    title: string;
    value: string | number;
}

const supportedNetworks = getSupportedChainIds();

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
    const blastProvider = useProvider({ chainId: +'0x13e31' });

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
            let tvlTotalUsd = 0,
                volumeTotalUsd = 0,
                feesTotalUsd = 0;

            let numChainsToAggregate = 0;
            if (supportedNetworks.includes('0x1')) numChainsToAggregate += 1;
            if (supportedNetworks.includes('0x82750'))
                numChainsToAggregate += 1;
            if (supportedNetworks.includes('0x13e31'))
                numChainsToAggregate += 1;

            let resultsReceived = 0;

            if (supportedNetworks.includes('0x1')) {
                const mainnetCrocEnv = mainnetProvider
                    ? new CrocEnv(mainnetProvider, undefined)
                    : undefined;
                if (!mainnetCrocEnv) return;
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
            }

            if (supportedNetworks.includes('0x82750')) {
                const scrollCrocEnv = scrollProvider
                    ? new CrocEnv(scrollProvider, undefined)
                    : undefined;
                if (!scrollCrocEnv) return;

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

            if (supportedNetworks.includes('0x13e31')) {
                const blastCrocEnv = blastProvider
                    ? new CrocEnv(blastProvider, undefined)
                    : undefined;
                if (!blastCrocEnv) return;

                getChainStats(
                    '0x13e31',
                    blastCrocEnv,
                    GCGO_BLAST_URL,
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
        }
    }, [
        mainnetProvider !== undefined &&
            scrollProvider !== undefined &&
            blastProvider !== undefined,
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

    const statsTitle = IS_TESTNET_SITE
        ? 'Testnet Stats'
        : !supportedNetworks.includes('0x1') &&
          supportedNetworks.includes('0x82750')
        ? 'Ambient x Scroll Stats'
        : !supportedNetworks.includes('0x1') &&
          supportedNetworks.includes('0x13e31')
        ? 'Ambient x Blast Stats'
        : 'Ambient Finance Stats';

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
