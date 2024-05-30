import { useState, useEffect, useMemo, useContext } from 'react';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { TokenContext } from '../../contexts/TokenContext';
import { CrocEnv } from '@crocswap-libs/sdk';
import { CachedDataContext } from '../../contexts/CachedDataContext';
import {
    getChainStats,
    getFormattedNumber,
} from '../../ambient-utils/dataLayer';
import {
    GCGO_BLAST_URL,
    GCGO_ETHEREUM_URL,
    GCGO_SCROLL_URL,
} from '../../ambient-utils/constants';

const useFetchAmbientStats = () => {
    const { mainnetProvider, scrollProvider, blastProvider } =
        useContext(CrocEnvContext);
    const { tokens } = useContext(TokenContext);
    const allDefaultTokens = tokens.allDefaultTokens;

    const mainnetCrocEnv = useMemo(
        () =>
            mainnetProvider
                ? new CrocEnv(mainnetProvider, undefined)
                : undefined,
        [mainnetProvider],
    );

    const scrollCrocEnv = useMemo(
        () =>
            scrollProvider ? new CrocEnv(scrollProvider, undefined) : undefined,
        [scrollProvider],
    );

    const blastCrocEnv = useMemo(
        () =>
            blastProvider ? new CrocEnv(blastProvider, undefined) : undefined,
        [blastProvider],
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
            mainnetCrocEnv &&
            scrollCrocEnv &&
            blastCrocEnv &&
            allDefaultTokens.length > 0
        ) {
            let tvlTotalUsd = 0,
                volumeTotalUsd = 0,
                feesTotalUsd = 0;

            const numChainsToAggregate = 3;
            let resultsReceived = 0;

            const updateStats = () => {
                if (resultsReceived === numChainsToAggregate) {
                    setTotalTvlString(
                        getFormattedNumber({
                            value: tvlTotalUsd,
                            prefix: '$',
                            isTvl: true,
                            mantissa: 1,
                        }),
                    );
                    setTotalVolumeString(
                        getFormattedNumber({
                            value: volumeTotalUsd,
                            prefix: '$',
                            mantissa: 1,
                        }),
                    );
                    setTotalFeesString(
                        getFormattedNumber({
                            value: feesTotalUsd,
                            prefix: '$',
                            mantissa: 1,
                        }),
                    );
                }
            };

            getChainStats(
                'cumulative',
                '0x1',
                mainnetCrocEnv,
                GCGO_ETHEREUM_URL,
                cachedFetchTokenPrice,
                15,
                allDefaultTokens,
            ).then((dexStats) => {
                if (!dexStats) return;
                tvlTotalUsd += dexStats.tvlTotalUsd;
                volumeTotalUsd += dexStats.volumeTotalUsd;
                feesTotalUsd += dexStats.feesTotalUsd;
                resultsReceived += 1;
                updateStats();
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
                if (!dexStats) return;
                tvlTotalUsd += dexStats.tvlTotalUsd;
                volumeTotalUsd += dexStats.volumeTotalUsd;
                feesTotalUsd += dexStats.feesTotalUsd;
                resultsReceived += 1;
                updateStats();
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
                if (!dexStats) return;
                tvlTotalUsd += dexStats.tvlTotalUsd;
                volumeTotalUsd += dexStats.volumeTotalUsd;
                feesTotalUsd += dexStats.feesTotalUsd;
                resultsReceived += 1;
                updateStats();
            });
        }
    }, [mainnetCrocEnv, scrollCrocEnv, blastCrocEnv, allDefaultTokens]);

    return { totalTvlString, totalVolumeString, totalFeesString };
};

export default useFetchAmbientStats;
