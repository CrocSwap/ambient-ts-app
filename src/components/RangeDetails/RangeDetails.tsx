import PriceInfo from './PriceInfo/PriceInfo';
import styles from './RangeDetails.module.css';
import { ethers } from 'ethers';
import { useEffect, useRef, useState } from 'react';
import printDomToImage from '../../utils/functions/printDomToImage';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
// import { toDisplayQty } from '@crocswap-libs/sdk';
import { formatAmountOld } from '../../utils/numbers';
import { PositionIF } from '../../utils/interfaces/PositionIF';
import APYGraphDisplay from './APYGraphDisplay/APYGraphDisplay';
import RangeDetailsControl from './RangeDetailsControl/RangeDetailsControl';
import RangeDetailsHeader from './RangeDetailsHeader/RangeDetailsHeader';
import RangeDetailsActions from './RangeDetailsActions/RangeDetailsActions';
import RangeStatus from '../Global/RangeStatus/RangeStatus';

interface IRangeDetailsProps {
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
    lastBlockNumber: number;
    positionApy: number;

    closeGlobalModal: () => void;
}

export default function RangeDetails(props: IRangeDetailsProps) {
    const {
        baseTokenAddress,
        quoteTokenAddress,
        baseTokenLogoURI,
        quoteTokenLogoURI,
        lowRangeDisplay,
        highRangeDisplay,
        chainId,
        user,
        bidTick,
        askTick,
        lastBlockNumber,
        position,
        positionApy,
        closeGlobalModal,
        isPositionInRange,
        isAmbient,
    } = props;

    const detailsRef = useRef(null);
    const downloadAsImage = () => {
        if (detailsRef.current) {
            printDomToImage(detailsRef.current);
        }
    };

    const httpGraphCacheServerDomain = 'https://809821320828123.de:5000';

    const [baseCollateralDisplay, setBaseCollateralDisplay] = useState<string | undefined>();
    const [quoteCollateralDisplay, setQuoteCollateralDisplay] = useState<string | undefined>();

    const [baseFeesDisplay, setBaseFeesDisplay] = useState<string | undefined>();
    const [quoteFeesDisplay, setQuoteFeesDisplay] = useState<string | undefined>();

    const [usdValue, setUsdValue] = useState<string | undefined>();

    // eslint-disable-next-line
    const [updatedPositionApy, setUpdatedPositionApy] = useState<number | undefined>(positionApy);

    useEffect(() => {
        const positionStatsCacheEndpoint = httpGraphCacheServerDomain + '/position_stats?';
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
                    const liqBaseNum = positionStats.positionLiqBaseDecimalCorrected;
                    const liqQuoteNum = positionStats.positionLiqQuoteDecimalCorrected;
                    const liqBaseDisplay = liqBaseNum
                        ? liqBaseNum < 2
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

                    const liqQuoteDisplay = liqQuoteNum
                        ? liqQuoteNum < 2
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

                    const usdValue = position.positionLiqTotalUSD;

                    if (usdValue) {
                        setUsdValue(
                            '$' +
                                usdValue.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }),
                        );
                    }

                    const baseFeeDisplayNum = positionStats.feesLiqBaseDecimalCorrected;
                    const quoteFeeDisplayNum = positionStats.feesLiqQuoteDecimalCorrected;

                    const baseFeeDisplayTruncated = !baseFeeDisplayNum
                        ? '0.00'
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
                        ? '0.00'
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

                    // if (positionStats.apy) {
                    //     setUpdatedPositionApy(positionStats.apy);
                    // }
                })
                .catch(console.log);

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
                .catch(console.log);
        }
    }, [lastBlockNumber]);

    const [controlItems, setControlItems] = useState([
        // { slug: 'times', name: 'Show times', checked: false },
        { slug: 'collateral', name: 'Show collateral', checked: true },
        { slug: 'value', name: 'Show value', checked: true },
    ]);

    const handleChange = (slug: string) => {
        const copyControlItems = [...controlItems];
        const modifiedControlItems = copyControlItems.map((item) => {
            if (slug === item.slug) {
                item.checked = !item.checked;
            }

            return item;
        });

        setControlItems(modifiedControlItems);
    };

    const [showSettings, setShowSettings] = useState(false);

    const controlDisplay = showSettings ? (
        <div className={styles.control_display_container}>
            {controlItems.map((item, idx) => (
                <RangeDetailsControl key={idx} item={item} handleChange={handleChange} />
            ))}
        </div>
    ) : null;

    return (
        <div className={styles.range_details_container}>
            <RangeDetailsHeader
                onClose={closeGlobalModal}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                downloadAsImage={downloadAsImage}
            />
            {controlDisplay}
            <div ref={detailsRef}>
                <div className={styles.main_content}>
                    <div className={styles.left_container}>
                        <PriceInfo
                            usdValue={usdValue ?? '…'}
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
                        />
                    </div>
                    <div className={styles.right_container}>
                        <APYGraphDisplay updatedPositionApy={updatedPositionApy} />
                    </div>
                    <RangeStatus isInRange={isPositionInRange} isAmbient={isAmbient} fullText />
                    <RangeDetailsActions />
                </div>
            </div>
        </div>
    );
}
