import PriceInfo from '.././PriceInfo/PriceInfo';
import styles from '../../../components/Global/TransactionDetails/TransactionDetailsModal.module.css';
import { memo, useContext, useEffect, useRef, useState } from 'react';
import {
    PositionIF,
    BlastRewardsDataIF,
    PositionServerIF,
} from '../../../ambient-utils/types';
import RangeDetailsHeader from '.././RangeDetailsHeader/RangeDetailsHeader';
import RangeDetailsSimplify from '.././RangeDetailsSimplify/RangeDetailsSimplify';
import TransactionDetailsGraph from '../../Global/TransactionDetails/TransactionDetailsGraph/TransactionDetailsGraph';
import { useProcessRange } from '../../../utils/hooks/useProcessRange';
import useCopyToClipboard from '../../../utils/hooks/useCopyToClipboard';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import {
    CACHE_UPDATE_FREQ_IN_MS,
    GCGO_OVERRIDE_URL,
} from '../../../ambient-utils/constants';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import {
    getPositionData,
    getFormattedNumber,
    printDomToImage,
} from '../../../ambient-utils/dataLayer';
import { TokenContext } from '../../../contexts/TokenContext';
import modalBackground from '../../../assets/images/backgrounds/background.png';
import { CachedDataContext } from '../../../contexts/CachedDataContext';
import Modal from '../../Global/Modal/Modal';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import {
    baseTokenForConcLiq,
    bigNumToFloat,
    quoteTokenForConcLiq,
    tickToPrice,
    toDisplayPrice,
} from '@crocswap-libs/sdk';
import { fetchPositionRewardsData } from '../../../ambient-utils/api/fetchPositionRewards';

interface propsIF {
    position: PositionIF;
    isAccountView: boolean;
    onClose: () => void;
}

function RangeDetailsModal(props: propsIF) {
    const [showShareComponent, setShowShareComponent] = useState(true);
    const { isDenomBase } = useContext(TradeDataContext);
    const {
        chainData: { chainId, poolIndex },
        provider,
        crocEnv,
        activeNetwork,
    } = useContext(CrocEnvContext);
    const { position, isAccountView, onClose } = props;

    const {
        base: baseTokenAddress,
        quote: quoteTokenAddress,
        baseTokenLogoURI: baseTokenLogoURI,
        quoteTokenLogoURI: quoteTokenLogoURI,
        baseSymbol: baseTokenSymbol,
        quoteSymbol: quoteTokenSymbol,
        user,
        bidTick,
        askTick,
        apy: positionApy,
    } = position;

    const { userAddress } = useContext(UserDataContext);

    const {
        posHash,
        // serverPositionId,
        isAmbient,
        isBaseTokenMoneynessGreaterOrEqual,
        minRangeDenomByMoneyness,
        maxRangeDenomByMoneyness,
        ambientOrMin: lowRangeDisplay,
        ambientOrMax: highRangeDisplay,
        baseTokenCharacter,
        quoteTokenCharacter,
    } = useProcessRange(position, crocEnv, userAddress);

    const [serverPositionId, setServerPositionId] = useState<
        string | undefined
    >();

    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);
    const {
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext(CachedDataContext);

    const { lastBlockNumber, isActiveNetworkBlast } =
        useContext(ChainDataContext);

    const detailsRef = useRef(null);

    const copyRangeDetailsToClipboard = async () => {
        if (detailsRef.current) {
            const blob = await printDomToImage(detailsRef.current, '#0d1117', {
                background: `url(${modalBackground}) no-repeat`,
                backgroundSize: 'cover',
            });
            if (blob) {
                copy(blob);
                openSnackbar('Shareable image copied to clipboard', 'info');
            }
        }
    };

    const { tokens } = useContext(TokenContext);

    const [baseCollateralDisplay, setBaseCollateralDisplay] = useState<
        string | undefined
    >();
    const [quoteCollateralDisplay, setQuoteCollateralDisplay] = useState<
        string | undefined
    >();

    const [baseFeesDisplay, setBaseFeesDisplay] = useState<
        string | undefined
    >();
    const [quoteFeesDisplay, setQuoteFeesDisplay] = useState<
        string | undefined
    >();

    const [usdValue, setUsdValue] = useState<string | undefined>();

    const [updatedPositionApy, setUpdatedPositionApy] = useState<
        number | undefined
    >(positionApy);

    const [_, copy] = useCopyToClipboard();

    function handleCopyPositionId() {
        copy(posHash.toString());
        openSnackbar(`${posHash.toString()} copied`, 'info');
    }

    const updateLiq = async () => {
        try {
            if (!crocEnv || !position) return;
            const pos = crocEnv.positions(
                position.base,
                position.quote,
                position.user,
            );

            const basePricePromise = cachedFetchTokenPrice(
                baseTokenAddress,
                chainId,
                crocEnv,
            );
            const quotePricePromise = cachedFetchTokenPrice(
                quoteTokenAddress,
                chainId,
                crocEnv,
            );

            const poolPriceNonDisplay = await cachedQuerySpotPrice(
                crocEnv,
                baseTokenAddress,
                quoteTokenAddress,
                chainId,
                lastBlockNumber,
            );

            const basePrice = await basePricePromise;
            const quotePrice = await quotePricePromise;
            const poolPrice = toDisplayPrice(
                poolPriceNonDisplay,
                position.baseDecimals,
                position.quoteDecimals,
            );

            if (isAmbient) {
                setBaseFeesDisplay('...');
                setQuoteFeesDisplay('...');

                const ambientLiqBigNum = (await pos.queryAmbient()).seeds;
                const liqNum = bigNumToFloat(ambientLiqBigNum);
                const liqBaseNum = liqNum * Math.sqrt(poolPriceNonDisplay);
                const liqQuoteNum = liqNum / Math.sqrt(poolPriceNonDisplay);

                const positionLiqBaseDecimalCorrected =
                    liqBaseNum / Math.pow(10, position.baseDecimals);
                const positionLiqQuoteDecimalCorrected =
                    liqQuoteNum / Math.pow(10, position.quoteDecimals);

                setBaseCollateralDisplay(
                    getFormattedNumber({
                        value: positionLiqBaseDecimalCorrected,
                        zeroDisplay: '0',
                    }),
                );

                setQuoteCollateralDisplay(
                    getFormattedNumber({
                        value: positionLiqQuoteDecimalCorrected,
                        zeroDisplay: '0',
                    }),
                );

                if (basePrice?.usdPrice && quotePrice?.usdPrice) {
                    setUsdValue(
                        getFormattedNumber({
                            value:
                                basePrice.usdPrice *
                                    positionLiqBaseDecimalCorrected +
                                quotePrice.usdPrice *
                                    positionLiqQuoteDecimalCorrected,
                            zeroDisplay: '0',
                            prefix: '$',
                        }),
                    );
                } else if (basePrice?.usdPrice) {
                    const quotePrice = basePrice.usdPrice * poolPrice;
                    setUsdValue(
                        getFormattedNumber({
                            value:
                                basePrice.usdPrice *
                                    positionLiqBaseDecimalCorrected +
                                quotePrice * positionLiqQuoteDecimalCorrected,
                            zeroDisplay: '0',
                            prefix: '$',
                        }),
                    );
                } else if (quotePrice?.usdPrice) {
                    const basePrice = quotePrice.usdPrice / poolPrice;
                    setUsdValue(
                        getFormattedNumber({
                            value:
                                quotePrice.usdPrice *
                                    positionLiqQuoteDecimalCorrected +
                                basePrice * positionLiqBaseDecimalCorrected,
                            zeroDisplay: '0',
                            prefix: '$',
                        }),
                    );
                }
            } else {
                const positionRewards = await pos.queryRewards(
                    position.bidTick,
                    position.askTick,
                );

                const baseRewards = bigNumToFloat(positionRewards.baseRewards);
                const quoteRewards = bigNumToFloat(
                    positionRewards.quoteRewards,
                );

                const feesLiqBaseDecimalCorrected =
                    baseRewards / Math.pow(10, position.baseDecimals);
                const feesLiqQuoteDecimalCorrected =
                    quoteRewards / Math.pow(10, position.quoteDecimals);

                const baseFeeDisplayTruncated = getFormattedNumber({
                    value: feesLiqBaseDecimalCorrected,
                    zeroDisplay: '0',
                });
                setBaseFeesDisplay(baseFeeDisplayTruncated);

                const quoteFeesDisplayTruncated = getFormattedNumber({
                    value: feesLiqQuoteDecimalCorrected,
                    zeroDisplay: '0',
                });
                setQuoteFeesDisplay(quoteFeesDisplayTruncated);

                const concLiqBigNum = (
                    await pos.queryRangePos(position.bidTick, position.askTick)
                ).liq;

                const positionLiqBaseNum = bigNumToFloat(
                    baseTokenForConcLiq(
                        poolPriceNonDisplay,
                        concLiqBigNum,
                        tickToPrice(position.bidTick),
                        tickToPrice(position.askTick),
                    ),
                );

                const positionLiqQuoteNum = bigNumToFloat(
                    quoteTokenForConcLiq(
                        poolPriceNonDisplay,
                        concLiqBigNum,
                        tickToPrice(position.bidTick),
                        tickToPrice(position.askTick),
                    ),
                );

                const positionLiqBaseDecimalCorrected =
                    positionLiqBaseNum / Math.pow(10, position.baseDecimals);
                const positionLiqQuoteDecimalCorrected =
                    positionLiqQuoteNum / Math.pow(10, position.quoteDecimals);

                setBaseCollateralDisplay(
                    getFormattedNumber({
                        value: positionLiqBaseDecimalCorrected,
                        zeroDisplay: '0',
                    }),
                );

                setQuoteCollateralDisplay(
                    getFormattedNumber({
                        value: positionLiqQuoteDecimalCorrected,
                        zeroDisplay: '0',
                    }),
                );
                if (basePrice?.usdPrice && quotePrice?.usdPrice) {
                    setUsdValue(
                        getFormattedNumber({
                            value:
                                basePrice.usdPrice *
                                    positionLiqBaseDecimalCorrected +
                                quotePrice.usdPrice *
                                    positionLiqQuoteDecimalCorrected,
                            zeroDisplay: '0',
                            prefix: '$',
                        }),
                    );
                } else if (basePrice?.usdPrice) {
                    const quotePrice = basePrice.usdPrice * poolPrice;
                    setUsdValue(
                        getFormattedNumber({
                            value:
                                basePrice.usdPrice *
                                    positionLiqBaseDecimalCorrected +
                                quotePrice * positionLiqQuoteDecimalCorrected,
                            zeroDisplay: '0',
                            prefix: '$',
                        }),
                    );
                } else if (quotePrice?.usdPrice) {
                    const basePrice = quotePrice.usdPrice / poolPrice;
                    setUsdValue(
                        getFormattedNumber({
                            value:
                                quotePrice.usdPrice *
                                    positionLiqQuoteDecimalCorrected +
                                basePrice * positionLiqBaseDecimalCorrected,
                            zeroDisplay: '0',
                            prefix: '$',
                        }),
                    );
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const positionStatsCacheEndpoint = GCGO_OVERRIDE_URL
            ? GCGO_OVERRIDE_URL + '/position_stats?'
            : activeNetwork.graphCacheUrl + '/position_stats?';

        updateLiq();

        if (position.positionType) {
            fetch(
                positionStatsCacheEndpoint +
                    new URLSearchParams({
                        user: user,
                        bidTick: bidTick.toString(),
                        askTick: askTick.toString(),
                        base: baseTokenAddress,
                        quote: quoteTokenAddress,
                        poolIdx: poolIndex.toString(),
                        chainId: chainId,
                        positionType: position.positionType,
                    }),
            )
                .then((response) => response?.json())
                .then(async (json) => {
                    if (!crocEnv || !provider || !json?.data) {
                        return;
                    }
                    setServerPositionId(json?.data?.positionId);
                    // temporarily skip ENS fetch
                    const skipENSFetch = true;
                    const positionPayload = json?.data as PositionServerIF;
                    const positionStats = await getPositionData(
                        positionPayload,
                        tokens.tokenUniv,
                        crocEnv,
                        provider,
                        chainId,
                        cachedFetchTokenPrice,
                        cachedQuerySpotPrice,
                        cachedTokenDetails,
                        cachedEnsResolve,
                        skipENSFetch,
                    );

                    setUpdatedPositionApy(positionStats.aprEst * 100);
                })
                .catch(console.error);
        }
    }, [
        Math.floor(Date.now() / CACHE_UPDATE_FREQ_IN_MS),
        !!crocEnv,
        !!provider,
        chainId,
    ]);

    const [blastRewardsData, setBlastRewardsData] =
        useState<BlastRewardsDataIF>({
            points: '...',
            gold: '...',
        });

    useEffect(() => {
        if (isActiveNetworkBlast) {
            fetchPositionRewardsData({ position }).then((rewards) => {
                rewards && setBlastRewardsData(rewards);
            });
        }
    }, [serverPositionId, isActiveNetworkBlast]);

    const [timeFirstMintMemo, setTimeFirstMintMemo] = useState<number>(
        position.timeFirstMint,
    );

    useEffect(() => {
        if (position.timeFirstMint) {
            setTimeFirstMintMemo(position.timeFirstMint);
        }
    }, [position.timeFirstMint]);

    const shareComponent = (
        <div
            ref={detailsRef}
            className={styles.main_outer_container}
            style={{ height: 'auto' }}
        >
            <div className={styles.main_content}>
                <div className={styles.left_container}>
                    <PriceInfo
                        position={position}
                        usdValue={usdValue !== undefined ? usdValue : '…'}
                        lowRangeDisplay={lowRangeDisplay}
                        highRangeDisplay={highRangeDisplay}
                        baseCollateralDisplay={baseCollateralDisplay}
                        quoteCollateralDisplay={quoteCollateralDisplay}
                        baseFeesDisplay={baseFeesDisplay}
                        quoteFeesDisplay={quoteFeesDisplay}
                        baseTokenLogoURI={baseTokenLogoURI}
                        quoteTokenLogoURI={quoteTokenLogoURI}
                        baseTokenSymbol={baseTokenSymbol}
                        quoteTokenSymbol={quoteTokenSymbol}
                        isDenomBase={isDenomBase}
                        isAmbient={isAmbient}
                        positionApy={updatedPositionApy}
                        minRangeDenomByMoneyness={minRangeDenomByMoneyness}
                        maxRangeDenomByMoneyness={maxRangeDenomByMoneyness}
                        baseTokenAddress={baseTokenAddress}
                        quoteTokenAddress={quoteTokenAddress}
                        blastRewardsData={blastRewardsData}
                        isBaseTokenMoneynessGreaterOrEqual={
                            isBaseTokenMoneynessGreaterOrEqual
                        }
                        isAccountView={isAccountView}
                        baseTokenCharacter={baseTokenCharacter}
                        quoteTokenCharacter={quoteTokenCharacter}
                    />
                </div>
                <div className={styles.right_container}>
                    <TransactionDetailsGraph
                        tx={position}
                        timeFirstMintMemo={timeFirstMintMemo}
                        transactionType={'liqchange'}
                        isBaseTokenMoneynessGreaterOrEqual={
                            isBaseTokenMoneynessGreaterOrEqual
                        }
                        isAccountView={isAccountView}
                    />
                </div>
            </div>
            <p className={styles.ambi_copyright}>ambient.finance</p>
        </div>
    );

    return (
        <Modal usingCustomHeader onClose={onClose}>
            <div className={styles.outer_container}>
                <RangeDetailsHeader
                    onClose={onClose}
                    copyRangeDetailsToClipboard={copyRangeDetailsToClipboard}
                    showShareComponent={showShareComponent}
                    setShowShareComponent={setShowShareComponent}
                    handleCopyPositionId={handleCopyPositionId}
                />
                {showShareComponent ? (
                    shareComponent
                ) : (
                    <RangeDetailsSimplify
                        position={position}
                        timeFirstMintMemo={timeFirstMintMemo}
                        baseFeesDisplay={baseFeesDisplay}
                        quoteFeesDisplay={quoteFeesDisplay}
                        isAccountView={isAccountView}
                        updatedPositionApy={updatedPositionApy}
                        blastRewardsData={blastRewardsData}
                    />
                )}
            </div>
        </Modal>
    );
}

export default memo(RangeDetailsModal);
