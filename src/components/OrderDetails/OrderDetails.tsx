import { useState, useRef, useEffect } from 'react';

import styles from './OrderDetails.module.css';
import OrderDetailsHeader from './OrderDetailsHeader/OrderDetailsHeader';
import printDomToImage from '../../utils/functions/printDomToImage';
import PriceInfo from '../OrderDetails/PriceInfo/PriceInfo';
import OrderGraphDisplay from './OrderGraphDisplay/OrderGraphDisplay';
import { useProcessOrder } from '../../utils/hooks/useProcessOrder';
import OrderDetailsControl from './OderDetailsControl/OrderDetailsControl';
import OrderDetailsActions from '../RangeDetails/OrderDetailsActions/OrderDetailsActions';
import { LimitOrderIF } from '../../utils/interfaces/exports';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
// import { formatAmountOld } from '../../utils/numbers';

interface IOrderDetailsProps {
    account: string;
    limitOrder: LimitOrderIF;
    lastBlockNumber: number;
    closeGlobalModal: () => void;
}

export default function OrderDetails(props: IOrderDetailsProps) {
    const { limitOrder, account } = props;
    // console.log({ limitOrder });
    const { isOrderFilled, userNameToDisplay, baseDisplayFrontend, quoteDisplayFrontend } =
        useProcessOrder(limitOrder, account);
    const lastBlock = useAppSelector((state) => state.graphData).lastBlock;

    const [isClaimable, setIsClaimable] = useState<boolean>(isOrderFilled);

    const [usdValue, setUsdValue] = useState<string>(limitOrder.totalValueUSD.toString());
    const [baseCollateralDisplay, setBaseCollateralDisplay] = useState<string>(baseDisplayFrontend);
    const [quoteCollateralDisplay, setQuoteCollateralDisplay] =
        useState<string>(quoteDisplayFrontend);

    const chainId = limitOrder.chainId;
    const user = limitOrder.user;
    const bidTick = limitOrder.bidTick;
    const askTick = limitOrder.askTick;
    const baseTokenAddress = limitOrder.base;
    const quoteTokenAddress = limitOrder.quote;
    const positionType = 'knockout';
    const isBid = !limitOrder.isBid ? 'false' : 'true';

    const httpGraphCacheServerDomain = 'https://809821320828123.de:5000';

    useEffect(() => {
        const positionStatsCacheEndpoint = httpGraphCacheServerDomain + '/position_stats?';

        const poolIndex = lookupChain(chainId).poolIndex;
        if (positionType) {
            fetch(
                positionStatsCacheEndpoint +
                    new URLSearchParams({
                        user: user,
                        bidTick: bidTick.toString(),
                        askTick: askTick.toString(),
                        isBid: isBid,
                        base: baseTokenAddress,
                        quote: quoteTokenAddress,
                        poolIdx: poolIndex.toString(),
                        chainId: chainId,
                        positionType: positionType,
                        addValue: 'true',
                        omitAPY: 'false',
                    }),
            )
                .then((response) => response?.json())
                .then((json) => {
                    const positionStats = json?.data;
                    console.log({ positionStats });
                    const liqBaseNum = positionStats.positionLiqBaseDecimalCorrected;
                    const liqQuoteNum = positionStats.positionLiqQuoteDecimalCorrected;
                    const claimableBaseNum = positionStats.claimableLiqBaseDecimalCorrected;
                    const claimableQuoteNum = positionStats.claimableLiqQuoteDecimalCorrected;

                    const isOrderClaimable = positionStats.claimableLiq !== '0';
                    setIsClaimable(isOrderClaimable);

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
                    // console.log({ liqBaseDisplay });

                    const claimableBaseDisplay = claimableBaseNum
                        ? claimableBaseNum < 2
                            ? claimableBaseNum.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 6,
                              })
                            : claimableBaseNum.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                              })
                        : undefined;
                    // console.log({ claimableBaseDisplay });

                    isOrderFilled
                        ? setBaseCollateralDisplay(claimableBaseDisplay ?? '0.00')
                        : setBaseCollateralDisplay(liqBaseDisplay ?? '0.00');

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
                    // console.log({ liqQuoteDisplay });

                    const claimableQuoteDisplay = claimableQuoteNum
                        ? claimableQuoteNum < 2
                            ? claimableQuoteNum.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 6,
                              })
                            : claimableQuoteNum.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                              })
                        : undefined;
                    // console.log({ claimableQuoteDisplay });

                    isOrderFilled
                        ? setQuoteCollateralDisplay(claimableQuoteDisplay ?? '0.00')
                        : setQuoteCollateralDisplay(liqQuoteDisplay ?? '0.00');

                    const usdValue = positionStats.totalValueUSD;
                    // console.log({ usdValue });

                    if (usdValue) {
                        setUsdValue(
                            usdValue.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }),
                        );
                    } else {
                        setUsdValue('0.00');
                    }

                    // const baseFeeDisplayNum = positionStats.feesLiqBaseDecimalCorrected;
                    // const quoteFeeDisplayNum = positionStats.feesLiqQuoteDecimalCorrected;

                    // const baseFeeDisplayTruncated = !baseFeeDisplayNum
                    //     ? '0.00'
                    //     : baseFeeDisplayNum < 0.0001
                    //     ? baseFeeDisplayNum.toExponential(2)
                    //     : baseFeeDisplayNum < 2
                    //     ? baseFeeDisplayNum.toPrecision(3)
                    //     : baseFeeDisplayNum >= 100000
                    //     ? formatAmountOld(baseFeeDisplayNum)
                    //     : // ? baseLiqDisplayNum.toExponential(2)
                    //       baseFeeDisplayNum.toLocaleString(undefined, {
                    //           minimumFractionDigits: 2,
                    //           maximumFractionDigits: 2,
                    //       });
                    // setBaseFeesDisplay(baseFeeDisplayTruncated);

                    // const quoteFeesDisplayTruncated = !quoteFeeDisplayNum
                    //     ? '0.00'
                    //     : quoteFeeDisplayNum < 0.0001
                    //     ? quoteFeeDisplayNum.toExponential(2)
                    //     : quoteFeeDisplayNum < 2
                    //     ? quoteFeeDisplayNum.toPrecision(3)
                    //     : quoteFeeDisplayNum >= 100000
                    //     ? formatAmountOld(quoteFeeDisplayNum)
                    //     : quoteFeeDisplayNum.toLocaleString(undefined, {
                    //           minimumFractionDigits: 2,
                    //           maximumFractionDigits: 2,
                    //       });
                    // setQuoteFeesDisplay(quoteFeesDisplayTruncated);

                    // if (positionStats.apy) {
                    //     setUpdatedPositionApy(positionStats.apy);
                    // }
                })
                .catch(console.log);

            // fetch(
            //     apyCacheEndpoint +
            //         new URLSearchParams({
            //             user: user,
            //             bidTick: bidTick.toString(),
            //             askTick: askTick.toString(),
            //             base: baseTokenAddress,
            //             quote: quoteTokenAddress,
            //             poolIdx: poolIndex.toString(),
            //             chainId: chainId,
            //             positionType: position.positionType,
            //             concise: 'true',
            //         }),
            // )
            //     .then((response) => response?.json())
            //     .then((json) => {
            //         const results = json?.data.results;
            //         const apr = results.apy;

            //         if (apr) {
            //             setUpdatedPositionApy(apr);
            //         }
            //     })
            //     .catch(console.log);
        }
    }, [lastBlock]);

    const [showSettings, setShowSettings] = useState(false);

    const detailsRef = useRef(null);
    const downloadAsImage = () => {
        if (detailsRef.current) {
            printDomToImage(detailsRef.current);
        }
    };

    const [controlItems, setControlItems] = useState([
        { slug: 'ticks', name: 'Show ticks', checked: true },
        { slug: 'liquidity', name: 'Show Liquidity', checked: true },
        { slug: 'value', name: 'Show value', checked: true },
    ]);

    const handleChange = (slug: string) => {
        const copyControlItems = [...controlItems];
        const modifiedControlItems = copyControlItems.map((item) => {
            if (slug === item.slug) item.checked = !item.checked;
            return item;
        });

        setControlItems(modifiedControlItems);
    };

    const controlDisplay = showSettings ? (
        <div className={styles.control_display_container}>
            {controlItems.map((item, idx) => (
                <OrderDetailsControl key={idx} item={item} handleChange={handleChange} />
            ))}
        </div>
    ) : null;

    return (
        <div className={styles.range_details_container}>
            <OrderDetailsHeader
                onClose={props.closeGlobalModal}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                downloadAsImage={downloadAsImage}
            />
            {controlDisplay}
            <div ref={detailsRef}>
                <div className={styles.main_content}>
                    <div className={styles.left_container}>
                        <PriceInfo
                            account={account}
                            limitOrder={limitOrder}
                            controlItems={controlItems}
                            usdValue={usdValue}
                            baseCollateralDisplay={baseCollateralDisplay}
                            quoteCollateralDisplay={quoteCollateralDisplay}
                            isOrderFilled={isClaimable}
                        />
                    </div>
                    <div className={styles.right_container}>
                        <OrderGraphDisplay isOrderFilled={isClaimable} user={userNameToDisplay} />
                    </div>
                    <OrderDetailsActions />
                </div>
            </div>
        </div>
    );
}
