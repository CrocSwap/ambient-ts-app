import PriceInfo from './PriceInfo/PriceInfo';
import styles from './RangeDetails.module.css';
import { useContext, useEffect, useRef, useState } from 'react';
import printDomToImage from '../../utils/functions/printDomToImage';
import { formatAmountOld } from '../../utils/numbers';
import { PositionIF } from '../../utils/interfaces/exports';
import RangeDetailsHeader from './RangeDetailsHeader/RangeDetailsHeader';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import RangeDetailsSimplify from './RangeDetailsSimplify/RangeDetailsSimplify';
import TransactionDetailsGraph from '../Global/TransactionDetails/TransactionDetailsGraph/TransactionDetailsGraph';
import { useProcessRange } from '../../utils/hooks/useProcessRange';
import useCopyToClipboard from '../../utils/hooks/useCopyToClipboard';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { GRAPHCACHE_SMALL_URL } from '../../constants';
import { AppStateContext } from '../../contexts/AppStateContext';
import { ChainDataContext } from '../../contexts/ChainDataContext';
import { PositionServerIF } from '../../utils/interfaces/PositionIF';
import { getPositionData } from '../../App/functions/getPositionData';
import { TokenContext } from '../../contexts/TokenContext';
import modalBackground from '../../assets/images/backgrounds/background.png';
import { CachedDataContext } from '../../contexts/CachedDataContext';

interface propsIF {
    position: PositionIF;
    user: string;
    bidTick: number;
    askTick: number;
    isAmbient: boolean;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    lowRangeDisplay: string;
    highRangeDisplay: string;
    isDenomBase: boolean;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    baseTokenAddress: string;
    quoteTokenAddress: string;
    positionApy: number;
    isAccountView: boolean;
    isBaseTokenMoneynessGreaterOrEqual: boolean;
    minRangeDenomByMoneyness: string;
    maxRangeDenomByMoneyness: string;
}

export default function RangeDetails(props: propsIF) {
    const [showShareComponent, setShowShareComponent] = useState(true);

    const {
        baseTokenAddress,
        quoteTokenAddress,
        baseTokenLogoURI,
        quoteTokenLogoURI,
        lowRangeDisplay,
        highRangeDisplay,
        user,
        bidTick,
        askTick,
        position,
        positionApy,
        isAmbient,
        isAccountView,
        isBaseTokenMoneynessGreaterOrEqual,
        minRangeDenomByMoneyness,
        maxRangeDenomByMoneyness,
    } = props;

    const { addressCurrent: userAddress } = useAppSelector(
        (state) => state.userData,
    );

    const {
        globalModal: { close: closeGlobalModal },
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

    // eslint-disable-next-line
    const [updatedPositionApy, setUpdatedPositionApy] = useState<
        number | undefined
    >(positionApy);

    const { crocEnv } = useContext(CrocEnvContext);

    const { posHash } = useProcessRange(position, userAddress);

    const [_, copy] = useCopyToClipboard();

    function handleCopyPositionId() {
        copy(posHash.toString());
        openSnackbar(`${posHash.toString()} copied`, 'info');
    }

    useEffect(() => {
        const positionStatsCacheEndpoint =
            GRAPHCACHE_SMALL_URL + '/position_stats?';

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
                        addValue: 'true',
                        omitAPY: 'true',
                    }),
            )
                .then((response) => response?.json())
                .then(async (json) => {
                    if (!crocEnv || !json?.data) {
                        setBaseCollateralDisplay(undefined);
                        setQuoteCollateralDisplay(undefined);
                        setUsdValue(undefined);
                        setBaseFeesDisplay(undefined);
                        setQuoteFeesDisplay(undefined);
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
                    const liqBaseNum =
                        positionStats.positionLiqBaseDecimalCorrected;
                    const liqQuoteNum =
                        positionStats.positionLiqQuoteDecimalCorrected;

                    const liqBaseDisplay =
                        liqBaseNum !== undefined
                            ? liqBaseNum === 0
                                ? '0'
                                : liqBaseNum < 2
                                ? liqBaseNum.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 6,
                                  })
                                : liqBaseNum.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  })
                            : undefined;
                    setBaseCollateralDisplay(liqBaseDisplay);

                    const liqQuoteDisplay =
                        liqQuoteNum !== undefined
                            ? liqQuoteNum === 0
                                ? '0'
                                : liqQuoteNum < 2
                                ? liqQuoteNum.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 6,
                                  })
                                : liqQuoteNum.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  })
                            : undefined;
                    setQuoteCollateralDisplay(liqQuoteDisplay);

                    const usdValue = position.totalValueUSD;
                    if (usdValue !== undefined) {
                        setUsdValue(
                            usdValue === 0
                                ? '0'
                                : usdValue.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  }),
                        );
                    } else {
                        setUsdValue(undefined);
                    }

                    const baseFeeDisplayNum =
                        positionStats.feesLiqBaseDecimalCorrected;
                    const quoteFeeDisplayNum =
                        positionStats.feesLiqQuoteDecimalCorrected;

                    const baseFeeDisplayTruncated = !baseFeeDisplayNum
                        ? '0'
                        : baseFeeDisplayNum < 0.0001
                        ? baseFeeDisplayNum.toExponential(2)
                        : baseFeeDisplayNum < 2
                        ? baseFeeDisplayNum.toPrecision(3)
                        : baseFeeDisplayNum >= 100000
                        ? formatAmountOld(baseFeeDisplayNum)
                        : // ? baseLiqDisplayNum.toExponential(2)
                          baseFeeDisplayNum.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          });
                    setBaseFeesDisplay(baseFeeDisplayTruncated);

                    const quoteFeesDisplayTruncated = !quoteFeeDisplayNum
                        ? '0'
                        : quoteFeeDisplayNum < 0.0001
                        ? quoteFeeDisplayNum.toExponential(2)
                        : quoteFeeDisplayNum < 2
                        ? quoteFeeDisplayNum.toPrecision(3)
                        : quoteFeeDisplayNum >= 100000
                        ? formatAmountOld(quoteFeeDisplayNum)
                        : quoteFeeDisplayNum.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          });
                    setQuoteFeesDisplay(quoteFeesDisplayTruncated);
                })
                .catch(console.error);
        }
    }, [lastBlockNumber, crocEnv, chainId]);

    // eslint-disable-next-line
    const [controlItems, setControlItems] = useState([
        // { slug: 'times', name: 'Show times', checked: false },
        { slug: 'collateral', name: 'Show collateral', checked: true },
        { slug: 'value', name: 'Show value', checked: true },
    ]);

    // const handleChange = (slug: string) => {
    //     const copyControlItems = [...controlItems];
    //     const modifiedControlItems = copyControlItems.map((item) => {
    //         if (slug === item.slug) {
    //             item.checked = !item.checked;
    //         }

    //         return item;
    //     });

    //     setControlItems(modifiedControlItems);
    // };

    // const controlDisplay = showSettings ? (
    //     <div className={styles.control_display_container}>
    //         {controlItems.map((item, idx) => (
    //             <RangeDetailsControl key={idx} item={item} handleChange={handleChange} />
    //         ))}
    //     </div>
    // ) : null;
    const shareComponent = (
        <div ref={detailsRef} className={styles.main_outer_container}>
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
                        baseTokenSymbol={props.baseTokenSymbol}
                        quoteTokenSymbol={props.quoteTokenSymbol}
                        isDenomBase={props.isDenomBase}
                        isAmbient={isAmbient}
                        positionApy={positionApy}
                        minRangeDenomByMoneyness={minRangeDenomByMoneyness}
                        maxRangeDenomByMoneyness={maxRangeDenomByMoneyness}
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
        <div className={styles.outer_container}>
            <RangeDetailsHeader
                onClose={closeGlobalModal}
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
                />
            )}
        </div>
    );
}
