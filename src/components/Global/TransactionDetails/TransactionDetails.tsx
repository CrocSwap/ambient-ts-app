import styles from './TransactionDetails.module.css';
import { useState, useRef, useContext, useEffect } from 'react';
import printDomToImage from '../../../utils/functions/printDomToImage';
import TransactionDetailsHeader from './TransactionDetailsHeader/TransactionDetailsHeader';
import TransactionDetailsPriceInfo from './TransactionDetailsPriceInfo/TransactionDetailsPriceInfo';
import TransactionDetailsGraph from './TransactionDetailsGraph/TransactionDetailsGraph';
import { TransactionIF } from '../../../utils/interfaces/exports';
import TransactionDetailsSimplify from './TransactionDetailsSimplify/TransactionDetailsSimplify';
import useCopyToClipboard from '../../../utils/hooks/useCopyToClipboard';
import { AppStateContext } from '../../../contexts/AppStateContext';
import modalBackground from '../../../assets/images/backgrounds/background.png';
import { GRAPHCACHE_SMALL_URL } from '../../../constants';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { PositionServerIF } from '../../../utils/interfaces/PositionIF';
import { getPositionData } from '../../../App/functions/getPositionData';
import { TokenContext } from '../../../contexts/TokenContext';
import { CachedDataContext } from '../../../contexts/CachedDataContext';

interface propsIF {
    tx: TransactionIF;
    isBaseTokenMoneynessGreaterOrEqual: boolean;
    isAccountView: boolean;
}

export default function TransactionDetails(props: propsIF) {
    const { tx, isBaseTokenMoneynessGreaterOrEqual, isAccountView } = props;
    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);

    const {
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext(CachedDataContext);

    const { lastBlockNumber } = useContext(ChainDataContext);
    const {
        crocEnv,
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    const { tokens } = useContext(TokenContext);

    const [updatedPositionApy, setUpdatedPositionApy] = useState<
        number | undefined
    >(1.01);

    useEffect(() => {
        const positionStatsCacheEndpoint =
            GRAPHCACHE_SMALL_URL + '/position_stats?';

        fetch(
            positionStatsCacheEndpoint +
                new URLSearchParams({
                    user: tx.user,
                    bidTick: tx.bidTick.toString(),
                    askTick: tx.askTick.toString(),
                    base: tx.base,
                    quote: tx.quote,
                    poolIdx: tx.poolIdx.toString(),
                    chainId: chainId,
                    positionType: tx.positionType,
                }),
        )
            .then((response) => response?.json())
            .then(async (json) => {
                if (!crocEnv || !json?.data) {
                    // setBaseCollateralDisplay(undefined);
                    // setQuoteCollateralDisplay(undefined);
                    // setUsdValue(undefined);
                    // setBaseFeesDisplay(undefined);
                    // setQuoteFeesDisplay(undefined);
                    return;
                }

                const positionPayload = json?.data as PositionServerIF;
                const positionStats = await getPositionData(
                    positionPayload,
                    tokens.tokenUniv,
                    crocEnv,
                    chainId,
                    lastBlockNumber,
                    cachedFetchTokenPrice,
                    cachedQuerySpotPrice,
                    cachedTokenDetails,
                    cachedEnsResolve,
                );
                // const liqBaseNum =
                //     positionStats.positionLiqBaseDecimalCorrected;
                // const liqQuoteNum =
                //     positionStats.positionLiqQuoteDecimalCorrected;

                // const liqBaseDisplay = getFormattedNumber({
                //     value: liqBaseNum,
                // });
                // setBaseCollateralDisplay(liqBaseDisplay);

                // const liqQuoteDisplay = getFormattedNumber({
                //     value: liqQuoteNum,
                // });
                // setQuoteCollateralDisplay(liqQuoteDisplay);

                // setUsdValue(
                //     getFormattedNumber({
                //         value: position.totalValueUSD,
                //         isUSD: true,
                //     }),
                // );

                setUpdatedPositionApy(
                    positionStats.aprEst
                        ? positionStats.aprEst * 100
                        : undefined,
                );

                // const baseFeeDisplayNum =
                //     positionStats.feesLiqBaseDecimalCorrected;
                // const quoteFeeDisplayNum =
                //     positionStats.feesLiqQuoteDecimalCorrected;

                // const baseFeeDisplayTruncated = getFormattedNumber({
                //     value: baseFeeDisplayNum,
                //     zeroDisplay: '0',
                // });
                // setBaseFeesDisplay(baseFeeDisplayTruncated);

                // const quoteFeesDisplayTruncated = getFormattedNumber({
                //     value: quoteFeeDisplayNum,
                //     zeroDisplay: '0',
                // });
                // setQuoteFeesDisplay(quoteFeesDisplayTruncated);
            })
            .catch(console.error);
    }, [lastBlockNumber, crocEnv, chainId]);

    const [showSettings, setShowSettings] = useState(false);
    const [showShareComponent, setShowShareComponent] = useState(true);

    const detailsRef = useRef(null);

    const copyTransactionDetailsToClipboard = async () => {
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

    const [controlItems] = useState([
        { slug: 'ticks', name: 'Show ticks', checked: true },
        { slug: 'liquidity', name: 'Show Liquidity', checked: true },
        { slug: 'value', name: 'Show value', checked: true },
    ]);

    const [_, copy] = useCopyToClipboard();

    function handleCopyAddress() {
        const txHash = tx.txHash;
        copy(txHash);
        openSnackbar(`${txHash} copied`, 'info');
    }

    const shareComponent = (
        <div ref={detailsRef} className={styles.main_outer_container}>
            <div className={styles.main_content}>
                <div className={styles.left_container}>
                    <TransactionDetailsPriceInfo
                        tx={tx}
                        controlItems={controlItems}
                        positionApy={updatedPositionApy}
                    />
                </div>
                <div className={styles.right_container}>
                    <TransactionDetailsGraph
                        tx={tx}
                        transactionType={tx.entityType}
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

    const transactionDetailsHeaderProps = {
        showSettings,
        setShowSettings,
        copyTransactionDetailsToClipboard,
        setShowShareComponent,
        showShareComponent,
        handleCopyAddress,
    };

    return (
        <div className={styles.outer_container}>
            <TransactionDetailsHeader {...transactionDetailsHeaderProps} />

            {showShareComponent ? (
                shareComponent
            ) : (
                <TransactionDetailsSimplify
                    tx={tx}
                    isAccountView={isAccountView}
                />
            )}
        </div>
    );
}
