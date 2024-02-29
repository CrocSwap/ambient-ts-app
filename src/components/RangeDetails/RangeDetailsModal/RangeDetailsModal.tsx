import PriceInfo from '.././PriceInfo/PriceInfo';
import styles from '../../../components/Global/TransactionDetails/TransactionDetailsModal.module.css';
import { memo, useContext, useEffect, useRef, useState } from 'react';
import { PositionIF, PositionServerIF } from '../../../ambient-utils/types';
import RangeDetailsHeader from '.././RangeDetailsHeader/RangeDetailsHeader';
import RangeDetailsSimplify from '.././RangeDetailsSimplify/RangeDetailsSimplify';
import TransactionDetailsGraph from '../../Global/TransactionDetails/TransactionDetailsGraph/TransactionDetailsGraph';
import { useProcessRange } from '../../../utils/hooks/useProcessRange';
import useCopyToClipboard from '../../../utils/hooks/useCopyToClipboard';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { GCGO_OVERRIDE_URL } from '../../../ambient-utils/constants';
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

interface propsIF {
    position: PositionIF;
    isAccountView: boolean;
    onClose: () => void;
}

function RangeDetailsModal(props: propsIF) {
    const [showShareComponent, setShowShareComponent] = useState(true);
    const { isDenomBase } = useContext(TradeDataContext);

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
        serverPositionId,
        isAmbient,
        isBaseTokenMoneynessGreaterOrEqual,
        minRangeDenomByMoneyness,
        maxRangeDenomByMoneyness,
        ambientOrMin: lowRangeDisplay,
        ambientOrMax: highRangeDisplay,
    } = useProcessRange(position, userAddress);

    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);
    const {
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext(CachedDataContext);
    const {
        chainData: { chainId, poolIndex },
        provider,
    } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);

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

    const { crocEnv, activeNetwork } = useContext(CrocEnvContext);

    const [_, copy] = useCopyToClipboard();

    function handleCopyPositionId() {
        copy(posHash.toString());
        openSnackbar(`${posHash.toString()} copied`, 'info');
    }

    useEffect(() => {
        const positionStatsCacheEndpoint = GCGO_OVERRIDE_URL
            ? GCGO_OVERRIDE_URL + '/position_stats?'
            : activeNetwork.graphCacheUrl + '/position_stats?';

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
                        setBaseCollateralDisplay(undefined);
                        setQuoteCollateralDisplay(undefined);
                        setUsdValue(undefined);
                        setBaseFeesDisplay(undefined);
                        setQuoteFeesDisplay(undefined);
                        return;
                    }
                    // temporarily skip ENS fetch
                    const skipENSFetch = true;
                    const positionPayload = json?.data as PositionServerIF;
                    const positionStats = await getPositionData(
                        positionPayload,
                        tokens.tokenUniv,
                        crocEnv,
                        provider,
                        chainId,
                        lastBlockNumber,
                        cachedFetchTokenPrice,
                        cachedQuerySpotPrice,
                        cachedTokenDetails,
                        cachedEnsResolve,
                        skipENSFetch,
                    );
                    const liqBaseNum =
                        positionStats.positionLiqBaseDecimalCorrected;
                    const liqQuoteNum =
                        positionStats.positionLiqQuoteDecimalCorrected;

                    const liqBaseDisplay = getFormattedNumber({
                        value: liqBaseNum,
                    });
                    setBaseCollateralDisplay(liqBaseDisplay);

                    const liqQuoteDisplay = getFormattedNumber({
                        value: liqQuoteNum,
                    });
                    setQuoteCollateralDisplay(liqQuoteDisplay);

                    setUsdValue(
                        getFormattedNumber({
                            value: position.totalValueUSD,
                            prefix: '$',
                        }),
                    );

                    setUpdatedPositionApy(positionStats.aprEst * 100);

                    const baseFeeDisplayNum =
                        positionStats.feesLiqBaseDecimalCorrected;
                    const quoteFeeDisplayNum =
                        positionStats.feesLiqQuoteDecimalCorrected;

                    const baseFeeDisplayTruncated = getFormattedNumber({
                        value: baseFeeDisplayNum,
                        zeroDisplay: '0',
                    });
                    setBaseFeesDisplay(baseFeeDisplayTruncated);

                    const quoteFeesDisplayTruncated = getFormattedNumber({
                        value: quoteFeeDisplayNum,
                        zeroDisplay: '0',
                    });
                    setQuoteFeesDisplay(quoteFeesDisplayTruncated);
                })
                .catch(console.error);
        }
    }, [lastBlockNumber, !!crocEnv, !!provider, chainId]);

    const shareComponent = (
        <div
            ref={detailsRef}
            className={styles.main_outer_container}
            style={{ height: 'auto' }}
        >
            <div className={styles.main_content}>
                <div className={styles.left_container}>
                    <PriceInfo
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
                        positionId={serverPositionId}
                    />
                </div>
                <div className={styles.right_container}>
                    <TransactionDetailsGraph
                        tx={position}
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
                        baseFeesDisplay={baseFeesDisplay}
                        quoteFeesDisplay={quoteFeesDisplay}
                        isAccountView={isAccountView}
                        updatedPositionApy={updatedPositionApy}
                    />
                )}
            </div>
        </Modal>
    );
}

export default memo(RangeDetailsModal);
