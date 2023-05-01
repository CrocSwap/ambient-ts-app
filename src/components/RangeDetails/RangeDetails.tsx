import PriceInfo from './PriceInfo/PriceInfo';
import styles from './RangeDetails.module.css';
import { ethers } from 'ethers';
import { useEffect, useRef, useState } from 'react';
import printDomToImage from '../../utils/functions/printDomToImage';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { formatAmountOld } from '../../utils/numbers';
import { PositionIF } from '../../utils/interfaces/exports';

import RangeDetailsHeader from './RangeDetailsHeader/RangeDetailsHeader';

import { SpotPriceFn } from '../../App/functions/querySpotPrice';
import { ChainSpec, CrocEnv, toDisplayPrice } from '@crocswap-libs/sdk';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import RangeDetailsSimplify from './RangeDetailsSimplify/RangeDetailsSimplify';
import TransactionDetailsGraph from '../Global/TransactionDetails/TransactionDetailsGraph/TransactionDetailsGraph';
import { useProcessRange } from '../../utils/hooks/useProcessRange';
import useCopyToClipboard from '../../utils/hooks/useCopyToClipboard';
import SnackbarComponent from '../Global/SnackbarComponent/SnackbarComponent';
import { GRAPHCACHE_URL } from '../../constants';

interface propsIF {
    crocEnv: CrocEnv | undefined;
    cachedQuerySpotPrice: SpotPriceFn;
    provider: ethers.providers.Provider | undefined;
    position: PositionIF;
    chainId: string;
    user: string;
    bidTick: number;
    askTick: number;
    isPositionInRange: boolean;
    isAmbient: boolean;
    baseTokenSymbol: string;
    baseTokenDecimals: number;
    quoteTokenSymbol: string;
    quoteTokenDecimals: number;
    lowRangeDisplay: string;
    highRangeDisplay: string;
    isDenomBase: boolean;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    baseTokenAddress: string;
    quoteTokenAddress: string;
    positionApy: number;
    account: string;
    isOnPortfolioPage: boolean;
    isBaseTokenMoneynessGreaterOrEqual: boolean;
    minRangeDenomByMoneyness: string;
    maxRangeDenomByMoneyness: string;
    closeGlobalModal: () => void;
    chainData: ChainSpec;
}

export default function RangeDetails(props: propsIF) {
    const [showShareComponent, setShowShareComponent] = useState(true);

    const {
        crocEnv,
        baseTokenAddress,
        baseTokenDecimals,
        quoteTokenDecimals,
        quoteTokenAddress,
        baseTokenLogoURI,
        quoteTokenLogoURI,
        lowRangeDisplay,
        highRangeDisplay,
        chainId,
        user,
        bidTick,
        askTick,
        position,
        positionApy,
        closeGlobalModal,
        // isPositionInRange,
        isAmbient,
        cachedQuerySpotPrice,
        account,
        isOnPortfolioPage,
        isBaseTokenMoneynessGreaterOrEqual,
        minRangeDenomByMoneyness,
        maxRangeDenomByMoneyness,
        chainData,
    } = props;

    const detailsRef = useRef(null);
    const downloadAsImage = () => {
        if (detailsRef.current) {
            printDomToImage(detailsRef.current);
        }
    };
    const lastBlockNumber = useAppSelector(
        (state) => state.graphData,
    ).lastBlock;

    const httpGraphCacheServerDomain = GRAPHCACHE_URL;

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

    const [poolPriceDisplay, setPoolPriceDisplay] = useState(0);

    const { posHash } = useProcessRange(position, account);

    const [openSnackbar, setOpenSnackbar] = useState(false);
    // eslint-disable-next-line
    const [value, copy] = useCopyToClipboard();

    function handleCopyPositionId() {
        copy(posHash.toString());
        setOpenSnackbar(true);
    }
    const snackbarContent = (
        <SnackbarComponent
            severity='info'
            setOpenSnackbar={setOpenSnackbar}
            openSnackbar={openSnackbar}
        >
            {value} copied
        </SnackbarComponent>
    );

    useEffect(() => {
        const positionStatsCacheEndpoint =
            httpGraphCacheServerDomain + '/position_stats?';
        const apyCacheEndpoint = httpGraphCacheServerDomain + '/position_apy?';

        const poolIndex = lookupChain(chainId).poolIndex;
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
                .then((json) => {
                    const positionStats = json?.data;
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

            fetch(
                apyCacheEndpoint +
                    new URLSearchParams({
                        user: user,
                        bidTick: bidTick.toString(),
                        askTick: askTick.toString(),
                        base: baseTokenAddress,
                        quote: quoteTokenAddress,
                        poolIdx: poolIndex.toString(),
                        chainId: chainId,
                        positionType: position.positionType,
                        concise: 'true',
                    }),
            )
                .then((response) => response?.json())
                .then((json) => {
                    const results = json?.data.results;
                    const apr = results.apy;

                    if (apr) {
                        setUpdatedPositionApy(apr);
                    }
                })
                .catch(console.error);
        }
        if (
            crocEnv &&
            baseTokenAddress &&
            quoteTokenAddress &&
            baseTokenDecimals &&
            quoteTokenDecimals &&
            lastBlockNumber !== 0
        ) {
            (async () => {
                const spotPrice = await cachedQuerySpotPrice(
                    crocEnv,
                    baseTokenAddress,
                    quoteTokenAddress,
                    chainId,
                    lastBlockNumber,
                );

                if (spotPrice) {
                    const newDisplayPrice = toDisplayPrice(
                        spotPrice,
                        baseTokenDecimals,
                        quoteTokenDecimals,
                    );
                    if (newDisplayPrice !== poolPriceDisplay) {
                        setPoolPriceDisplay(newDisplayPrice);
                    }
                }
            })();
        }
    }, [lastBlockNumber]);
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

    const [showSettings, setShowSettings] = useState(false);

    // const controlDisplay = showSettings ? (
    //     <div className={styles.control_display_container}>
    //         {controlItems.map((item, idx) => (
    //             <RangeDetailsControl key={idx} item={item} handleChange={handleChange} />
    //         ))}
    //     </div>
    // ) : null;

    const shareComponent = (
        <div ref={detailsRef}>
            <div className={styles.main_content}>
                <div className={styles.left_container}>
                    <PriceInfo
                        poolPriceDisplay={poolPriceDisplay}
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
                        controlItems={controlItems}
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
                        isOnPortfolioPage={isOnPortfolioPage}
                        chainData={chainData}
                    />
                    {/* <RangeGraphDisplay updatedPositionApy={updatedPositionApy} position={position} /> */}
                </div>
                {/* <RangeDetailsActions /> */}
            </div>
            <p className={styles.ambi_copyright}>ambient.finance</p>
        </div>
    );

    return (
        <div className={styles.range_details_container}>
            <RangeDetailsHeader
                position={position}
                onClose={closeGlobalModal}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                downloadAsImage={downloadAsImage}
                showShareComponent={showShareComponent}
                setShowShareComponent={setShowShareComponent}
                handleCopyPositionId={handleCopyPositionId}
            />
            {showShareComponent ? (
                shareComponent
            ) : (
                <RangeDetailsSimplify
                    account={account}
                    position={position}
                    baseFeesDisplay={baseFeesDisplay}
                    quoteFeesDisplay={quoteFeesDisplay}
                    isOnPortfolioPage={isOnPortfolioPage}
                />
            )}
            {snackbarContent}
        </div>
    );
}
