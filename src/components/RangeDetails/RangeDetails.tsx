import PriceInfo from './PriceInfo/PriceInfo';
import styles from './RangeDetails.module.css';
import { ethers } from 'ethers';
import { useEffect, useRef, useState } from 'react';
import printDomToImage from '../../utils/functions/printDomToImage';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { toDisplayQty } from '@crocswap-libs/sdk';
import { formatAmount } from '../../utils/numbers';
import { PositionIF } from '../../utils/interfaces/PositionIF';
import APYGraphDisplay from './APYGraphDisplay/APYGraphDisplay';
import RangeDetailsControl from './RangeDetailsControl/RangeDetailsControl';
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
        // positionApy,
    } = props;

    const detailsRef = useRef(null);
    // eslint-disable-next-line
    const downloadAsImage = () => {
        if (detailsRef.current) {
            printDomToImage(detailsRef.current);
        }
    };

    const httpGraphCacheServerDomain = 'https://809821320828123.de:5000';

    const [baseLiquidityDisplay, setBaseLiquidityDisplay] = useState<string | undefined>(undefined);
    const [quoteLiquidityDisplay, setQuoteLiquidityDisplay] = useState<string | undefined>(
        undefined,
    );

    const [baseFeesDisplay, setBaseFeesDisplay] = useState<string | undefined>(undefined);
    const [quoteFeesDisplay, setQuoteFeesDisplay] = useState<string | undefined>(undefined);

    // eslint-disable-next-line
    const [positionApy, setPositionApy] = useState<number | undefined>();
    // eslint-disable-next-line
    const [apy, setApy] = useState<number | undefined>(positionApy);

    useEffect(() => {
        const positionStatsCacheEndpoint = httpGraphCacheServerDomain + '/position_stats?';

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
                    }),
            )
                .then((response) => response?.json())
                .then((json) => {
                    const positionStats = json?.data;
                    // console.log({ positionStats });
                    if (positionStats.posLiqBase && positionStats.baseDecimals) {
                        const baseLiqDisplayNum = parseFloat(
                            toDisplayQty(positionStats.posLiqBase, positionStats.baseDecimals),
                        );
                        const baseLiqDisplayTruncated =
                            baseLiqDisplayNum === 0
                                ? '0'
                                : baseLiqDisplayNum < 0.0001
                                ? baseLiqDisplayNum.toExponential(2)
                                : baseLiqDisplayNum < 2
                                ? baseLiqDisplayNum.toPrecision(3)
                                : baseLiqDisplayNum >= 100000
                                ? formatAmount(baseLiqDisplayNum)
                                : // ? baseLiqDisplayNum.toExponential(2)
                                  baseLiqDisplayNum.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  });
                        setBaseLiquidityDisplay(baseLiqDisplayTruncated);
                    }

                    if (positionStats.posLiqQuote && positionStats.quoteDecimals) {
                        const quoteLiqDisplayNum = parseFloat(
                            toDisplayQty(positionStats.posLiqQuote, positionStats.quoteDecimals),
                        );
                        const quoteLiqDisplayTruncated =
                            quoteLiqDisplayNum === 0
                                ? '0'
                                : quoteLiqDisplayNum < 0.0001
                                ? quoteLiqDisplayNum.toExponential(2)
                                : quoteLiqDisplayNum < 2
                                ? quoteLiqDisplayNum.toPrecision(3)
                                : quoteLiqDisplayNum >= 100000
                                ? formatAmount(quoteLiqDisplayNum)
                                : // ? quoteLiqDisplayNum.toExponential(2)
                                  quoteLiqDisplayNum.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  });
                        setQuoteLiquidityDisplay(quoteLiqDisplayTruncated);
                    }
                    if (positionStats.feeLiqBase && positionStats.baseDecimals) {
                        const baseFeeDisplayNum = parseFloat(
                            toDisplayQty(positionStats.feeLiqBase, positionStats.baseDecimals),
                        );
                        const baseFeeDisplayTruncated =
                            baseFeeDisplayNum === 0
                                ? '0'
                                : baseFeeDisplayNum < 0.0001
                                ? baseFeeDisplayNum.toExponential(2)
                                : baseFeeDisplayNum < 2
                                ? baseFeeDisplayNum.toPrecision(3)
                                : baseFeeDisplayNum >= 100000
                                ? formatAmount(baseFeeDisplayNum)
                                : // ? baseLiqDisplayNum.toExponential(2)
                                  baseFeeDisplayNum.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  });
                        setBaseFeesDisplay(baseFeeDisplayTruncated);
                    }

                    if (positionStats.feeLiqQuote && positionStats.quoteDecimals) {
                        const quoteFeesDisplayNum = parseFloat(
                            toDisplayQty(positionStats.feeLiqQuote, positionStats.quoteDecimals),
                        );
                        const quoteFeesDisplayTruncated =
                            quoteFeesDisplayNum === 0
                                ? '0'
                                : quoteFeesDisplayNum < 0.0001
                                ? quoteFeesDisplayNum.toExponential(2)
                                : quoteFeesDisplayNum < 2
                                ? quoteFeesDisplayNum.toPrecision(3)
                                : quoteFeesDisplayNum >= 100000
                                ? formatAmount(quoteFeesDisplayNum)
                                : // ? quoteFeesDisplayNum.toExponential(2)
                                  quoteFeesDisplayNum.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  });
                        setQuoteFeesDisplay(quoteFeesDisplayTruncated);
                    }
                    if (positionStats.apy) {
                        setApy(positionStats.apy);
                    }
                })
                .catch(console.log);
        }

        // (async () => {
        //     const positionApyCacheEndpoint = 'https://809821320828123.de:5000' + '/position_apy?';

        //     const positionApy =
        //         position.positionType === 'ambient'
        //             ? await fetch(
        //                   positionApyCacheEndpoint +
        //                       new URLSearchParams({
        //                           chainId: position.chainId,
        //                           user: position.user,
        //                           base: position.base,
        //                           quote: position.quote,
        //                           poolIdx: position.poolIdx.toString(),
        //                           concise: 'true',
        //                           positionType: 'ambient',
        //                       }),
        //               )
        //                   .then((response) => response?.json())
        //                   .then((json) => {
        //                       const apy = json.data?.results?.apy;
        //                       return apy;
        //                   })
        //             : await fetch(
        //                   positionApyCacheEndpoint +
        //                       new URLSearchParams({
        //                           chainId: position.chainId,
        //                           user: position.user,
        //                           base: position.base,
        //                           quote: position.quote,
        //                           bidTick: position.bidTick.toString(),
        //                           askTick: position.askTick.toString(),
        //                           poolIdx: position.poolIdx.toString(),
        //                           concise: 'true',
        //                           positionType: 'concentrated',
        //                       }),
        //               )
        //                   .then((response) => response?.json())
        //                   .then((json) => {
        //                       const apy = json?.data?.results?.apy;
        //                       return apy;
        //                   });

        //     setPositionApy(positionApy);
        // })();
    }, [lastBlockNumber]);

    const [controlItems, setControlItems] = useState([
        { slug: 'times', name: 'Show times', checked: true },
        { slug: 'collateral', name: 'Show collateral', checked: true },
        { slug: 'value', name: 'Show value', checked: false },
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

    const controlDisplay = (
        <div className={styles.control_display_container}>
            {controlItems.map((item, idx) => (
                <RangeDetailsControl key={idx} item={item} handleChange={handleChange} />
            ))}
        </div>
    );

    return (
        <div className={styles.range_details_container}>
            {controlDisplay}
            <div ref={detailsRef}>
                {/* <RemoveRangeHeader
                    isPositionInRange={props.isPositionInRange}
                    isAmbient={props.isAmbient}
                    baseTokenSymbol={props.baseTokenSymbol}
                    quoteTokenSymbol={props.quoteTokenSymbol}
                    baseTokenLogoURI={props.baseTokenLogoURI}
                    quoteTokenLogoURI={props.quoteTokenLogoURI}
                    isDenomBase={props.isDenomBase}
                /> */}
                <div className={styles.main_content}>
                    <div className={styles.left_container}>
                        <PriceInfo
                            lowRangeDisplay={lowRangeDisplay}
                            highRangeDisplay={highRangeDisplay}
                            baseLiquidityDisplay={baseLiquidityDisplay || '0.00'}
                            quoteLiquidityDisplay={quoteLiquidityDisplay || '0.00'}
                            baseFeesDisplay={baseFeesDisplay || '0.00'}
                            quoteFeesDisplay={quoteFeesDisplay || '0.00'}
                            baseTokenLogoURI={baseTokenLogoURI}
                            quoteTokenLogoURI={quoteTokenLogoURI}
                            baseTokenSymbol={props.baseTokenSymbol}
                            quoteTokenSymbol={props.quoteTokenSymbol}
                            isDenomBase={props.isDenomBase}
                            controlItems={controlItems}
                        />
                    </div>
                    <div className={styles.right_container}>
                        <APYGraphDisplay />
                    </div>
                    {/* <TokenInfo
                        provider={props.provider}
                        chainId={chainId}
                        baseTokenAddress={props.baseTokenAddress}
                        baseTokenDecimals={props.baseTokenDecimals}
                        quoteTokenAddress={props.quoteTokenAddress}
                        quoteTokenDecimals={props.quoteTokenDecimals}
                        lastBlockNumber={props.lastBlockNumber}
                        isDenomBase={props.isDenomBase}
                        positionApy={apy}
                    /> */}
                </div>
            </div>

            {/* <div onClick={downloadAsImage} className={styles.share_container}>
                <BsDownload size={15} />
            </div> */}
        </div>
    );
}
