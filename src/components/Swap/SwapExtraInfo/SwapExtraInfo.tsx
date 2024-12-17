import { CrocSmartSwapImpact, CrocSmartSwapRoute } from '@crocswap-libs/sdk';
import { memo, useContext } from 'react';
import {
    getFormattedNumber,
    getPriceImpactString,
} from '../../../ambient-utils/dataLayer';
import { PoolContext } from '../../../contexts/PoolContext';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import { ExtraInfo } from '../../Trade/TradeModules/ExtraInfo/ExtraInfo';
import { useTokens } from '../../../App/hooks/useTokens';
import { AppStateContext } from '../../../contexts';

interface propsIF {
    priceImpact: CrocSmartSwapImpact | undefined;
    slippageTolerance: number;
    liquidityFee: number | undefined;
    swapGasPriceinDollars: string | undefined;
    isOnTradeRoute?: boolean;
    effectivePriceWithDenom: number | undefined;
    showExtraInfoDropdown: boolean;
    showWarning: boolean;
    route: CrocSmartSwapRoute | undefined;
}

function SwapExtraInfo(props: propsIF) {
    const {
        priceImpact,
        effectivePriceWithDenom,
        slippageTolerance,
        liquidityFee,
        swapGasPriceinDollars,
        showExtraInfoDropdown,
        showWarning,
        route,
    } = props;

    const { poolPriceDisplay, isTradeDollarizationEnabled, usdPrice } =
        useContext(PoolContext);

    const { baseToken, quoteToken, isDenomBase } = useContext(TradeDataContext);
    const { activeNetwork } = useContext(AppStateContext);
    const { getTokenByAddress } = useTokens(activeNetwork.chainId, undefined);

    const baseTokenSymbol = baseToken.symbol;
    const quoteTokenSymbol = quoteToken.symbol;

    const liquidityProviderFeeString = liquidityFee
        ? (liquidityFee * 100).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          }) + ' %'
        : '...';

    const displayPriceWithDenom = poolPriceDisplay
        ? isDenomBase
            ? 1 / poolPriceDisplay
            : (poolPriceDisplay ?? 0)
        : effectivePriceWithDenom;

    const displayPriceString = displayPriceWithDenom
        ? getFormattedNumber({
              value: displayPriceWithDenom,
          })
        : '…';

    const usdPriceDisplay = usdPrice
        ? getFormattedNumber({ value: usdPrice })
        : '…';

    const finalPriceWithDenom = !isDenomBase
        ? 1 / (priceImpact?.finalPrice || 1)
        : priceImpact?.finalPrice || 1;

    const finalPriceString = getFormattedNumber({ value: finalPriceWithDenom });

    // prevent swaps with a price impact in excess of -99.99% or 1 million percent
    const priceImpactNum =
        !priceImpact?.percentChange ||
        priceImpact.percentChange < -0.9999 ||
        priceImpact.percentChange > 10000
            ? undefined
            : Math.abs(priceImpact.percentChange) * 100;

    const priceImpactExceedsThreshold =
        priceImpactNum !== undefined && priceImpactNum > 2;

    let swapRoute = '';
    if (route) {
        for (let i = 0; i < route?.paths[0].hops.length; i++) {
            const tokenAddr = route?.paths[0].hops[i].token;
            const token = getTokenByAddress(tokenAddr);
            swapRoute += token?.symbol;
            if (i < route?.paths[0].hops.length - 1) swapRoute += ' ➔ ';
        }
    }

    const extraInfo = [
        {
            title: 'Avg. Rate',
            tooltipTitle:
                'Expected Conversion Rate After Price Impact and Provider Fee',
            data:
                effectivePriceWithDenom !== undefined
                    ? isDenomBase
                        ? `${getFormattedNumber({
                              value: effectivePriceWithDenom,
                          })} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                        : `${getFormattedNumber({
                              value: effectivePriceWithDenom,
                          })} ${baseTokenSymbol} per ${quoteTokenSymbol}`
                    : '...',
            placement: 'bottom',
        },
    ];
    if (route && route?.paths[0].hops.length > 2) {
        extraInfo.push({
            title: 'Swap route',
            tooltipTitle: 'Tokens involved in the multihop swap',
            data: swapRoute,
            placement: 'bottom',
        });
    } else {
        extraInfo.push(
            ...[
                {
                    title: 'Final Price',
                    tooltipTitle: 'Expected Pool Price After Swap',
                    data:
                        priceImpactNum !== undefined
                            ? isDenomBase
                                ? `${finalPriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                                : `${finalPriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`
                            : '...',
                    placement: 'bottom',
                },
                {
                    title: 'Price Impact',
                    tooltipTitle:
                        'Difference Between Current (Spot) Price and Final Price',
                    data: priceImpactNum
                        ? `${getPriceImpactString(priceImpactNum)} %`
                        : '...',
                    placement: 'bottom',
                },
            ],
        );
    }
    extraInfo.push(
        ...[
            {
                title: 'Slippage Tolerance',
                tooltipTitle: 'This can be changed in settings.',
                data: `${slippageTolerance} %`,
                placement: 'bottom', // TODO: is this needed?
            },
            {
                title: 'Liquidity Provider Fee',
                tooltipTitle:
                    route && route?.paths[0].hops.length == 2
                        ? `This is a dynamically updated rate to reward ${
                              isDenomBase ? baseTokenSymbol : quoteTokenSymbol
                          } / ${
                              isDenomBase ? quoteTokenSymbol : baseTokenSymbol
                          } liquidity providers.`
                        : `This is a dynamically updated rate to reward liquidity
                  providers in pools along the swap route.`,
                data: liquidityProviderFeeString,
                placement: 'bottom',
            },
        ],
    );

    const conversionRateNonUsd = isDenomBase
        ? `1 ${baseTokenSymbol} ≈ ${displayPriceString} ${quoteTokenSymbol}`
        : `1 ${quoteTokenSymbol} ≈ ${displayPriceString} ${baseTokenSymbol}`;

    const conversionRateUsd = isDenomBase
        ? `1 ${baseTokenSymbol} ≈ ${usdPriceDisplay} USD`
        : `1 ${quoteTokenSymbol} ≈ ${usdPriceDisplay} USD`;

    const conversionRate = isTradeDollarizationEnabled
        ? conversionRateUsd
        : conversionRateNonUsd;

    return (
        <ExtraInfo
            extraInfo={extraInfo}
            conversionRate={conversionRate}
            gasPrice={swapGasPriceinDollars}
            showDropdown={showExtraInfoDropdown}
            showWarning={showWarning}
            priceImpactExceedsThreshold={priceImpactExceedsThreshold}
            route={route}
        />
    );
}

export default memo(SwapExtraInfo);
