import PriceInfo from './PriceInfo/PriceInfo';
import styles from './RangeDetails.module.css';
import { ethers } from 'ethers';
import { useEffect, useRef, useState } from 'react';
import printDomToImage from '../../utils/functions/printDomToImage';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
// import { toDisplayQty } from '@crocswap-libs/sdk';
import { formatAmount } from '../../utils/numbers';
import { PositionIF } from '../../utils/interfaces/PositionIF';
import APYGraphDisplay from './APYGraphDisplay/APYGraphDisplay';
import RangeDetailsControl from './RangeDetailsControl/RangeDetailsControl';
import RangeDetailsHeader from './RangeDetailsHeader/RangeDetailsHeader';
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
    } = props;

    const detailsRef = useRef(null);
    // eslint-disable-next-line
    const downloadAsImage = () => {
        if (detailsRef.current) {
            printDomToImage(detailsRef.current);
        }
    };

    const httpGraphCacheServerDomain = 'https://809821320828123.de:5000';

    const [baseLiquidityDisplay, setBaseLiquidityDisplay] = useState<string | undefined>();
    const [quoteLiquidityDisplay, setQuoteLiquidityDisplay] = useState<string | undefined>();

    const [baseFeesDisplay, setBaseFeesDisplay] = useState<string | undefined>();
    const [quoteFeesDisplay, setQuoteFeesDisplay] = useState<string | undefined>();

    // eslint-disable-next-line
    const [updatedPositionApy, setUpdatedPositionApy] = useState<number | undefined>(positionApy);

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
                        annotate: 'true',
                    }),
            )
                .then((response) => response?.json())
                .then((json) => {
                    const positionStats = json?.data;
                    const liqBaseNum = position.positionLiqBaseDecimalCorrected;
                    const liqQuoteNum = position.positionLiqQuoteDecimalCorrected;

                    if (liqBaseNum) {
                        const baseLiqDisplayTruncated =
                            liqBaseNum === 0
                                ? '0'
                                : liqBaseNum < 0.0001
                                ? liqBaseNum.toExponential(2)
                                : liqBaseNum < 2
                                ? liqBaseNum.toPrecision(3)
                                : liqBaseNum >= 100000
                                ? formatAmount(liqBaseNum)
                                : // ? baseLiqDisplayNum.toExponential(2)
                                  liqBaseNum.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  });

                        setBaseLiquidityDisplay(baseLiqDisplayTruncated);
                    }
                    if (liqQuoteNum) {
                        const quoteLiqDisplayTruncated =
                            liqQuoteNum === 0
                                ? '0'
                                : liqQuoteNum < 0.0001
                                ? liqQuoteNum.toExponential(2)
                                : liqQuoteNum < 2
                                ? liqQuoteNum.toPrecision(3)
                                : liqQuoteNum >= 100000
                                ? formatAmount(liqQuoteNum)
                                : // ? quoteLiqDisplayNum.toExponential(2)
                                  liqQuoteNum.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  });
                        setQuoteLiquidityDisplay(quoteLiqDisplayTruncated);
                    }

                    const baseFeeDisplayNum = position.feesLiqBaseDecimalCorrected;
                    const quoteFeeDisplayNum = position.feesLiqQuoteDecimalCorrected;

                    if (baseFeeDisplayNum && quoteFeeDisplayNum) {
                        // const baseFeeDisplayNum = parseFloat(
                        //     toDisplayQty(positionStats.feeLiqBase, positionStats.baseDecimals),
                        // );
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

                        const quoteFeesDisplayTruncated =
                            quoteFeeDisplayNum === 0
                                ? '0'
                                : quoteFeeDisplayNum < 0.0001
                                ? quoteFeeDisplayNum.toExponential(2)
                                : quoteFeeDisplayNum < 2
                                ? quoteFeeDisplayNum.toPrecision(3)
                                : quoteFeeDisplayNum >= 100000
                                ? formatAmount(quoteFeeDisplayNum)
                                : quoteFeeDisplayNum.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  });
                        setQuoteFeesDisplay(quoteFeesDisplayTruncated);
                    }

                    if (positionStats.apy) {
                        setUpdatedPositionApy(positionStats.apy);
                    }
                })
                .catch(console.log);
        }
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
            />
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
                            baseLiquidityDisplay={baseLiquidityDisplay}
                            quoteLiquidityDisplay={quoteLiquidityDisplay}
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
