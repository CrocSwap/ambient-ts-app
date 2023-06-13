import { useState, useRef, useEffect, useContext } from 'react';

import styles from './OrderDetails.module.css';
import OrderDetailsHeader from './OrderDetailsHeader/OrderDetailsHeader';
import PriceInfo from '../OrderDetails/PriceInfo/PriceInfo';
import { useProcessOrder } from '../../utils/hooks/useProcessOrder';
import { LimitOrderIF } from '../../utils/interfaces/exports';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import OrderDetailsSimplify from './OrderDetailsSimplify/OrderDetailsSimplify';
import TransactionDetailsGraph from '../Global/TransactionDetails/TransactionDetailsGraph/TransactionDetailsGraph';
import { formatAmountOld } from '../../utils/numbers';
import useCopyToClipboard from '../../utils/hooks/useCopyToClipboard';
import { GRAPHCACHE_SMALL_URL, IS_LOCAL_ENV } from '../../constants';
import { AppStateContext } from '../../contexts/AppStateContext';
import { LimitOrderServerIF } from '../../utils/interfaces/LimitOrderIF';
import { getLimitOrderData } from '../../App/functions/getLimitOrderData';
import { ChainDataContext } from '../../contexts/ChainDataContext';
import { TokenContext } from '../../contexts/TokenContext';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import modalBackground from '../../assets/images/backgrounds/background.png';
import printDomToImage from '../../utils/functions/printDomToImage';
import { CachedDataContext } from '../../contexts/CachedDataContext';

interface propsIF {
    limitOrder: LimitOrderIF;
    isBaseTokenMoneynessGreaterOrEqual: boolean;
    isAccountView: boolean;
}

export default function OrderDetails(props: propsIF) {
    const { limitOrder, isBaseTokenMoneynessGreaterOrEqual, isAccountView } =
        props;

    const [showShareComponent, setShowShareComponent] = useState(true);
    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);
    const {
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext(CachedDataContext);
    const { crocEnv } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const { tokens } = useContext(TokenContext);

    const { addressCurrent: userAddress } = useAppSelector(
        (state) => state.userData,
    );

    const {
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
        posHash,
    } = useProcessOrder(limitOrder, userAddress);

    const [isClaimable, setIsClaimable] = useState<boolean>(isOrderFilled);

    const [_, copy] = useCopyToClipboard();

    function handleCopyPositionId() {
        copy(posHash);
        openSnackbar(`${posHash} copied`, 'info');
    }

    const [usdValue, setUsdValue] = useState<string>('...');
    // const [usdValue, setUsdValue] = useState<string>(limitOrder.totalValueUSD.toString());
    const [baseCollateralDisplay, setBaseCollateralDisplay] =
        useState<string>(baseDisplayFrontend);
    const [quoteCollateralDisplay, setQuoteCollateralDisplay] =
        useState<string>(quoteDisplayFrontend);

    const chainId = limitOrder.chainId;
    const user = limitOrder.user;
    const bidTick = limitOrder.bidTick;
    const askTick = limitOrder.askTick;
    const pivotTime = limitOrder.pivotTime;
    const baseTokenAddress = limitOrder.base;
    const quoteTokenAddress = limitOrder.quote;
    const positionType = 'knockout';

    const isBid = limitOrder.isBid;

    const limitPriceString = truncatedDisplayPrice
        ? truncatedDisplayPrice
        : '0';

    const parsedLimitPriceNum = parseFloat(limitPriceString.replace(/,/, ''));
    const baseDisplayFrontendNum = parseFloat(
        baseDisplayFrontend.replace(/,/, ''),
    );
    const quoteDisplayFrontendNum = parseFloat(
        quoteDisplayFrontend.replace(/,/, ''),
    );

    const isFillStarted = isBid
        ? quoteDisplayFrontendNum !== 0
        : baseDisplayFrontendNum !== 0;

    const approximateSellQty = isBid
        ? isDenomBase
            ? quoteDisplayFrontendNum / parsedLimitPriceNum
            : quoteDisplayFrontendNum * parsedLimitPriceNum
        : isDenomBase
        ? baseDisplayFrontendNum * parsedLimitPriceNum
        : baseDisplayFrontendNum / parsedLimitPriceNum;

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

    useEffect(() => {
        const positionStatsCacheEndpoint =
            GRAPHCACHE_SMALL_URL + '/limit_stats?';

        const poolIndex = lookupChain(chainId).poolIndex;
        if (positionType && crocEnv) {
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
                        pivotTime: pivotTime.toString(),
                        positionType: positionType,
                        addValue: 'true',
                        omitAPY: 'false',
                    }),
            )
                .then((response) => response?.json())
                .then((json) => {
                    const positionPayload = json?.data as LimitOrderServerIF;
                    return getLimitOrderData(
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
                })
                .then((positionStats: LimitOrderIF) => {
                    IS_LOCAL_ENV && console.debug({ positionStats });
                    const liqBaseNum =
                        positionStats.positionLiqBaseDecimalCorrected;
                    const liqQuoteNum =
                        positionStats.positionLiqQuoteDecimalCorrected;
                    const claimableBaseNum =
                        positionStats.claimableLiqBaseDecimalCorrected;
                    const claimableQuoteNum =
                        positionStats.claimableLiqQuoteDecimalCorrected;

                    const isOrderClaimable = positionStats.claimableLiq !== 0;
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

                    isOrderFilled
                        ? setBaseCollateralDisplay(
                              claimableBaseDisplay ?? '0.00',
                          )
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

                    isOrderFilled
                        ? setQuoteCollateralDisplay(
                              claimableQuoteDisplay ?? '0.00',
                          )
                        : setQuoteCollateralDisplay(liqQuoteDisplay ?? '0.00');

                    const usdValue = positionStats.totalValueUSD;

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
                .catch(console.error);
        }
    }, [lastBlockNumber]);

    const detailsRef = useRef(null);

    const copyOrderDetailsToClipboard = async () => {
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

    // eslint-disable-next-line
    const [controlItems, setControlItems] = useState([
        { slug: 'ticks', name: 'Show ticks', checked: true },
        { slug: 'liquidity', name: 'Show Liquidity', checked: true },
        { slug: 'value', name: 'Show value', checked: true },
    ]);
    const shareComponent = (
        <div ref={detailsRef} className={styles.main_outer_container}>
            <div className={styles.main_content}>
                <div className={styles.left_container}>
                    <PriceInfo
                        limitOrder={limitOrder}
                        controlItems={controlItems}
                        usdValue={usdValue}
                        isBid={isBid}
                        isDenomBase={isDenomBase}
                        baseCollateralDisplay={baseCollateralDisplay}
                        quoteCollateralDisplay={quoteCollateralDisplay}
                        isOrderFilled={isClaimable}
                        approximateSellQtyTruncated={
                            approximateSellQtyTruncated
                        }
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
            <OrderDetailsHeader
                copyOrderDetailsToClipboard={copyOrderDetailsToClipboard}
                showShareComponent={showShareComponent}
                setShowShareComponent={setShowShareComponent}
                handleCopyPositionId={handleCopyPositionId}
            />

            {showShareComponent ? (
                shareComponent
            ) : (
                <OrderDetailsSimplify
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
                    isAccountView={isAccountView}
                />
            )}
        </div>
    );
}
