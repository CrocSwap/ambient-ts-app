import {
    baseTokenForConcLiq,
    bigIntToFloat,
    quoteTokenForConcLiq,
    tickToPrice,
    toDisplayPrice,
} from '@crocswap-libs/sdk';
import { memo, useContext, useEffect, useRef, useState } from 'react';
import { fetchPositionRewardsData } from '../../../../../ambient-utils/api/fetchPositionRewards';
import { CACHE_UPDATE_FREQ_IN_MS } from '../../../../../ambient-utils/constants';
import {
    getFormattedNumber,
    getPositionData,
    printDomToImage,
} from '../../../../../ambient-utils/dataLayer';
import {
    BlastRewardsDataIF,
    PositionIF,
    PositionServerIF,
} from '../../../../../ambient-utils/types';
import modalBackground from '../../../../../assets/images/backgrounds/background.png';
import { AppStateContext } from '../../../../../contexts/AppStateContext';
import { CachedDataContext } from '../../../../../contexts/CachedDataContext';
import { ChainDataContext } from '../../../../../contexts/ChainDataContext';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TokenContext } from '../../../../../contexts/TokenContext';
import { TradeDataContext } from '../../../../../contexts/TradeDataContext';
import { UserDataContext } from '../../../../../contexts/UserDataContext';
import useCopyToClipboard from '../../../../../utils/hooks/useCopyToClipboard';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';
import { useProcessRange } from '../../../../../utils/hooks/useProcessRange';
import Modal from '../../../Modal/Modal';
import ModalHeader from '../../../ModalHeader/ModalHeader';
import DetailsHeader from '../../DetailsHeader/DetailsHeader';
import MobileDetailTabs from '../../MobileDetailTabs/MobileDetailTabs';
import TransactionDetailsGraph from '../../TransactionDetailsGraph/TransactionDetailsGraph';
import styles from '../../TransactionDetailsModal.module.css';
import PriceInfo from '../PriceInfo/PriceInfo';
import RangeDetailsSimplify from '../RangeDetailsSimplify/RangeDetailsSimplify';

interface propsIF {
    position: PositionIF;
    isAccountView: boolean;
    onClose: () => void;
}

function RangeDetailsModal(props: propsIF) {
    const { position, isAccountView, onClose } = props;

    const showMobileVersion = useMediaQuery('(max-width: 768px)');

    const [showShareComponent, setShowShareComponent] = useState(true);
    const { isDenomBase } = useContext(TradeDataContext);
    const { provider, crocEnv } = useContext(CrocEnvContext);

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
        isAmbient,
        isBaseTokenMoneynessGreaterOrEqual,
        minRangeDenomByMoneyness,
        maxRangeDenomByMoneyness,
        ambientOrMin: lowRangeDisplay,
        ambientOrMax: highRangeDisplay,
        baseTokenCharacter,
        quoteTokenCharacter,
        userMatchesConnectedAccount,
    } = useProcessRange(position, crocEnv, userAddress);

    const [serverPositionId, setServerPositionId] = useState<
        string | undefined
    >();

    const {
        activeNetwork: { GCGO_URL, chainId, poolIndex },
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
            if (!crocEnv || (await crocEnv.context).chain.chainId !== chainId)
                return;
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

                const ambientLiqBigInt = (await pos.queryAmbientPos()).liq;
                const liqNum = bigIntToFloat(ambientLiqBigInt);
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

                const baseRewards = bigIntToFloat(positionRewards[1]);
                const quoteRewards = bigIntToFloat(positionRewards[2]);

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

                const concLiqBigInt = (
                    await pos.queryRangePos(position.bidTick, position.askTick)
                ).liq;

                const positionLiqBaseNum = bigIntToFloat(
                    baseTokenForConcLiq(
                        poolPriceNonDisplay,
                        concLiqBigInt,
                        tickToPrice(position.bidTick),
                        tickToPrice(position.askTick),
                    ),
                );

                const positionLiqQuoteNum = bigIntToFloat(
                    quoteTokenForConcLiq(
                        poolPriceNonDisplay,
                        concLiqBigInt,
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
                                    (positionLiqBaseDecimalCorrected +
                                        feesLiqBaseDecimalCorrected) +
                                quotePrice.usdPrice *
                                    (positionLiqQuoteDecimalCorrected +
                                        feesLiqQuoteDecimalCorrected),
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
                                    (positionLiqBaseDecimalCorrected +
                                        feesLiqBaseDecimalCorrected) +
                                quotePrice *
                                    (positionLiqQuoteDecimalCorrected +
                                        feesLiqQuoteDecimalCorrected),
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
                                    (positionLiqQuoteDecimalCorrected +
                                        feesLiqQuoteDecimalCorrected) +
                                basePrice *
                                    (positionLiqBaseDecimalCorrected +
                                        feesLiqBaseDecimalCorrected),
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
        const positionStatsCacheEndpoint = GCGO_URL + '/position_stats?';

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
                    const forceOnchainLiqUpdate = userMatchesConnectedAccount;
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
                        forceOnchainLiqUpdate,
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
        userMatchesConnectedAccount,
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

    const PriceInfoProps = {
        position: position,
        usdValue: usdValue !== undefined ? usdValue : '…',
        lowRangeDisplay: lowRangeDisplay,
        highRangeDisplay: highRangeDisplay,
        baseCollateralDisplay: baseCollateralDisplay,
        quoteCollateralDisplay: quoteCollateralDisplay,
        baseFeesDisplay: baseFeesDisplay,
        quoteFeesDisplay: quoteFeesDisplay,
        baseTokenLogoURI: baseTokenLogoURI,
        quoteTokenLogoURI: quoteTokenLogoURI,
        baseTokenSymbol: baseTokenSymbol,
        quoteTokenSymbol: quoteTokenSymbol,
        isDenomBase: isDenomBase,
        isAmbient: isAmbient,
        positionApy: updatedPositionApy,
        minRangeDenomByMoneyness: minRangeDenomByMoneyness,
        maxRangeDenomByMoneyness: maxRangeDenomByMoneyness,
        baseTokenAddress: baseTokenAddress,
        quoteTokenAddress: quoteTokenAddress,
        blastRewardsData: blastRewardsData,
        isBaseTokenMoneynessGreaterOrEqual: isBaseTokenMoneynessGreaterOrEqual,
        isAccountView: isAccountView,
        baseTokenCharacter: baseTokenCharacter,
        quoteTokenCharacter: quoteTokenCharacter,
    };

    const HeaderProps = {
        onClose: onClose,
        handleCopyAction: handleCopyPositionId,
        copyToClipboard: copyRangeDetailsToClipboard,
        showShareComponent: showShareComponent,
        setShowShareComponent: setShowShareComponent,
        tooltipCopyAction: 'Copy position slot ID to clipboard',
        tooltipCopyImage: 'Copy shareable image',
    };
    const GraphProps = {
        tx: position,
        timeFirstMintMemo: timeFirstMintMemo,
        transactionType: 'liqchange',
        isBaseTokenMoneynessGreaterOrEqual: isBaseTokenMoneynessGreaterOrEqual,
        isAccountView: isAccountView,
    };

    const DetailProps = {
        position: position,
        timeFirstMintMemo: timeFirstMintMemo,
        baseFeesDisplay: baseFeesDisplay,
        quoteFeesDisplay: quoteFeesDisplay,
        isAccountView: isAccountView,
        updatedPositionApy: updatedPositionApy,
        blastRewardsData: blastRewardsData,
    };

    const shareComponent = (
        <div
            ref={detailsRef}
            className={styles.main_outer_container}
            style={{ height: 'auto' }}
        >
            <div className={styles.main_content}>
                <div className={styles.left_container}>
                    <PriceInfo {...PriceInfoProps} />
                </div>
                <div className={styles.right_container}>
                    <TransactionDetailsGraph {...GraphProps} />
                </div>
            </div>
            <p className={styles.ambi_copyright}>ambient.finance</p>
        </div>
    );
    const shareComponentMobile = (
        <Modal usingCustomHeader onClose={onClose}>
            <div className={styles.transaction_details_mobile}>
                <ModalHeader title={'Range Details'} onClose={onClose} />
                <MobileDetailTabs
                    showShareComponent={showShareComponent}
                    setShowShareComponent={setShowShareComponent}
                />
                {!showShareComponent ? (
                    <RangeDetailsSimplify {...DetailProps} />
                ) : (
                    <div
                        className={styles.mobile_price_graph_container}
                        style={{ marginTop: '12px' }}
                    >
                        <PriceInfo {...PriceInfoProps} />
                        <div className={styles.graph_section_mobile}>
                            <TransactionDetailsGraph {...GraphProps} />
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
    if (showMobileVersion) return shareComponentMobile;
    return (
        <Modal usingCustomHeader onClose={onClose}>
            <div className={styles.outer_container}>
                <DetailsHeader {...HeaderProps} />

                {showShareComponent ? (
                    shareComponent
                ) : (
                    <RangeDetailsSimplify {...DetailProps} />
                )}
            </div>
        </Modal>
    );
}

export default memo(RangeDetailsModal);
