import { useState, useRef, useEffect } from 'react';

import styles from './OrderDetails.module.css';
import OrderDetailsHeader from './OrderDetailsHeader/OrderDetailsHeader';
import printDomToImage from '../../utils/functions/printDomToImage';
import PriceInfo from '../OrderDetails/PriceInfo/PriceInfo';
import { useProcessOrder } from '../../utils/hooks/useProcessOrder';
import { LimitOrderIF } from '../../utils/interfaces/exports';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import OrderDetailsSimplify from './OrderDetailsSimplify/OrderDetailsSimplify';
import TransactionDetailsGraph from '../Global/TransactionDetails/TransactionDetailsGraph/TransactionDetailsGraph';
import { formatAmountOld } from '../../utils/numbers';

interface propsIF {
    account: string;
    limitOrder: LimitOrderIF;
    lastBlockNumber: number;
    closeGlobalModal: () => void;
    isBaseTokenMoneynessGreaterOrEqual: boolean;
    isOnPortfolioPage: boolean;
}

export default function OrderDetails(props: propsIF) {
    const [showShareComponent, setShowShareComponent] = useState(true);

    const { limitOrder, account, isBaseTokenMoneynessGreaterOrEqual, isOnPortfolioPage } = props;

    const lastBlock = useAppSelector((state) => state.graphData).lastBlock;
    const {
        // usdValue,
        baseTokenSymbol,
        quoteTokenSymbol,
        baseDisplayFrontend,
        quoteDisplayFrontend,
        isDenomBase,
        baseTokenLogo,
        quoteTokenLogo,
        isOrderFilled,
        truncatedDisplayPrice,
        truncatedDisplayPriceDenomByMoneyness,
    } = useProcessOrder(limitOrder, account);

    const [isClaimable, setIsClaimable] = useState<boolean>(isOrderFilled);

    const [usdValue, setUsdValue] = useState<string>('...');
    // const [usdValue, setUsdValue] = useState<string>(limitOrder.totalValueUSD.toString());
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

    // console.log({ limitOrder });

    const isBid = limitOrder.isBid;

    const limitPriceString = truncatedDisplayPrice ? truncatedDisplayPrice : '0';
    // console.log({ limitPriceString });

    const parsedLimitPriceNum = parseFloat(limitPriceString.replace(/,/, ''));
    const baseDisplayFrontendNum = parseFloat(baseDisplayFrontend.replace(/,/, ''));
    const quoteDisplayFrontendNum = parseFloat(quoteDisplayFrontend.replace(/,/, ''));

    const isFillStarted = isBid ? quoteDisplayFrontendNum !== 0 : baseDisplayFrontendNum !== 0;

    const approximateSellQty = isBid
        ? isDenomBase
            ? quoteDisplayFrontendNum / parsedLimitPriceNum
            : quoteDisplayFrontendNum * parsedLimitPriceNum
        : isDenomBase
        ? baseDisplayFrontendNum * parsedLimitPriceNum
        : baseDisplayFrontendNum / parsedLimitPriceNum;

    // console.log({ approximateSellQty });

    const approximateSellQtyTruncated =
        approximateSellQty === 0
            ? '0'
            : approximateSellQty < 0.0001
            ? approximateSellQty.toExponential(2)
            : approximateSellQty < 2
            ? approximateSellQty.toPrecision(3)
            : approximateSellQty >= 100000
            ? formatAmountOld(approximateSellQty)
            : approximateSellQty.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    // console.log({ parsedLimitPriceNum });

    const approximateBuyQty = isFillStarted
        ? isBid
            ? isDenomBase
                ? approximateSellQty * parsedLimitPriceNum
                : approximateSellQty / parsedLimitPriceNum
            : isDenomBase
            ? approximateSellQty / parsedLimitPriceNum
            : approximateSellQty * parsedLimitPriceNum
        : isBid
        ? isDenomBase
            ? baseDisplayFrontendNum * parsedLimitPriceNum
            : baseDisplayFrontendNum / parsedLimitPriceNum
        : isDenomBase
        ? quoteDisplayFrontendNum / parsedLimitPriceNum
        : quoteDisplayFrontendNum * parsedLimitPriceNum;

    // console.log({ approximateBuyQty });

    const approximateBuyQtyTruncated =
        approximateBuyQty === 0
            ? '0'
            : approximateBuyQty < 0.0001
            ? approximateBuyQty.toExponential(2)
            : approximateBuyQty < 2
            ? approximateBuyQty.toPrecision(3)
            : approximateBuyQty >= 100000
            ? formatAmountOld(approximateBuyQty)
            : approximateBuyQty.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

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
                        isBid: isBid ? 'true' : 'false',
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
                })
                .catch(console.log);
        }
    }, [lastBlock]);

    const [showSettings, setShowSettings] = useState(false);

    const detailsRef = useRef(null);
    const downloadAsImage = () => {
        if (detailsRef.current) {
            printDomToImage(detailsRef.current);
        }
    };
    // eslint-disable-next-line
    const [controlItems, setControlItems] = useState([
        { slug: 'ticks', name: 'Show ticks', checked: true },
        { slug: 'liquidity', name: 'Show Liquidity', checked: true },
        { slug: 'value', name: 'Show value', checked: true },
    ]);

    // const handleChange = (slug: string) => {
    //     const copyControlItems = [...controlItems];
    //     const modifiedControlItems = copyControlItems.map((item) => {
    //         if (slug === item.slug) item.checked = !item.checked;
    //         return item;
    //     });

    //     setControlItems(modifiedControlItems);
    // };

    // const controlDisplay = showSettings ? (
    //     <div className={styles.control_display_container}>
    //         {controlItems.map((item, idx) => (
    //             <OrderDetailsControl key={idx} item={item} handleChange={handleChange} />
    //         ))}
    //     </div>
    // ) : null;

    const shareComponent = (
        <div ref={detailsRef}>
            <div className={styles.main_content}>
                <div className={styles.left_container}>
                    <PriceInfo
                        account={account}
                        limitOrder={limitOrder}
                        controlItems={controlItems}
                        usdValue={usdValue}
                        isBid={isBid}
                        isDenomBase={isDenomBase}
                        baseCollateralDisplay={baseCollateralDisplay}
                        quoteCollateralDisplay={quoteCollateralDisplay}
                        isOrderFilled={isClaimable}
                        approximateSellQtyTruncated={approximateSellQtyTruncated}
                        approximateBuyQtyTruncated={approximateBuyQtyTruncated}
                        baseDisplayFrontend={baseDisplayFrontend}
                        quoteDisplayFrontend={quoteDisplayFrontend}
                        quoteTokenLogo={quoteTokenLogo}
                        baseTokenLogo={baseTokenLogo}
                        baseTokenSymbol={baseTokenSymbol}
                        quoteTokenSymbol={quoteTokenSymbol}
                        isFillStarted={isFillStarted}
                        truncatedDisplayPrice={truncatedDisplayPrice}
                        truncatedDisplayPriceDenomByMoneyness={
                            truncatedDisplayPriceDenomByMoneyness
                        }
                    />
                </div>
                <div className={styles.right_container}>
                    <TransactionDetailsGraph
                        tx={limitOrder}
                        transactionType={'limitOrder'}
                        isBaseTokenMoneynessGreaterOrEqual={isBaseTokenMoneynessGreaterOrEqual}
                        isOnPortfolioPage={isOnPortfolioPage}
                    />
                </div>
            </div>
            <p className={styles.ambi_copyright}>ambient.finance</p>
        </div>
    );

    return (
        <div className={styles.order_details_container}>
            <OrderDetailsHeader
                limitOrder={limitOrder}
                onClose={props.closeGlobalModal}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                downloadAsImage={downloadAsImage}
                showShareComponent={showShareComponent}
                setShowShareComponent={setShowShareComponent}
            />

            {showShareComponent ? (
                shareComponent
            ) : (
                <OrderDetailsSimplify
                    account={account}
                    limitOrder={limitOrder}
                    usdValue={usdValue}
                    isBid={isBid}
                    isDenomBase={isDenomBase}
                    baseCollateralDisplay={baseCollateralDisplay}
                    quoteCollateralDisplay={quoteCollateralDisplay}
                    isOrderFilled={isClaimable}
                    approximateSellQtyTruncated={approximateSellQtyTruncated}
                    approximateBuyQtyTruncated={approximateBuyQtyTruncated}
                    baseDisplayFrontend={baseDisplayFrontend}
                    quoteDisplayFrontend={quoteDisplayFrontend}
                    quoteTokenLogo={quoteTokenLogo}
                    baseTokenLogo={baseTokenLogo}
                    baseTokenSymbol={baseTokenSymbol}
                    quoteTokenSymbol={quoteTokenSymbol}
                    isFillStarted={isFillStarted}
                    truncatedDisplayPrice={truncatedDisplayPrice}
                />
            )}
        </div>
    );
}
