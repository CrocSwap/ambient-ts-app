import { memo, useContext } from 'react';
import { CrocImpact } from '@crocswap-libs/sdk';
import { PoolContext } from '../../../contexts/PoolContext';
import {
    getFormattedNumber,
    getPriceImpactString,
} from '../../../ambient-utils/dataLayer';
import { ExtraInfo } from '../../Trade/TradeModules/ExtraInfo/ExtraInfo';
import { TradeDataContext } from '../../../contexts/TradeDataContext';

interface propsIF {
    priceImpact: CrocImpact | undefined;
    slippageTolerance: number;
    liquidityProviderFeeString: string;
    swapGasPriceinDollars: string | undefined;
    isOnTradeRoute?: boolean;
    effectivePriceWithDenom: number | undefined;
    showExtraInfoDropdown: boolean;
}

function SwapExtraInfo(props: propsIF) {
    const {
        priceImpact,
        effectivePriceWithDenom,
        slippageTolerance,
        liquidityProviderFeeString,
        swapGasPriceinDollars,
        showExtraInfoDropdown,
    } = props;

    const { poolPriceDisplay } = useContext(PoolContext);

    const { baseToken, quoteToken, isDenomBase } = useContext(TradeDataContext);

    const baseTokenSymbol = baseToken.symbol;
    const quoteTokenSymbol = quoteToken.symbol;

    const displayPriceWithDenom =
        isDenomBase && poolPriceDisplay
            ? 1 / poolPriceDisplay
            : poolPriceDisplay ?? 0;

    const displayPriceString = getFormattedNumber({
        value: displayPriceWithDenom,
    });

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

    const extraInfo = [
        {
            title: 'Avg. Rate',
            tooltipTitle:
                'Expected Conversion Rate After Price Impact and Provider Fee',
            data:
                priceImpactNum !== undefined
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
            data: `${getPriceImpactString(priceImpactNum)} %`,
            placement: 'bottom',
        },
        {
            title: 'Slippage Tolerance',
            tooltipTitle: 'This can be changed in settings.',
            data: `${slippageTolerance} %`,
        },
        {
            title: 'Liquidity Provider Fee',
            tooltipTitle: `This is a dynamically updated rate to reward ${
                isDenomBase ? baseTokenSymbol : quoteTokenSymbol
            } / ${
                isDenomBase ? quoteTokenSymbol : baseTokenSymbol
            } liquidity providers.`,
            data: `${liquidityProviderFeeString} %`,
            placement: 'bottom',
        },
    ];

    const conversionRate = isDenomBase
        ? `1 ${baseTokenSymbol} ≈ ${displayPriceString} ${quoteTokenSymbol}`
        : `1 ${quoteTokenSymbol} ≈ ${displayPriceString} ${baseTokenSymbol}`;

    return (
        <ExtraInfo
            extraInfo={extraInfo}
            conversionRate={conversionRate}
            gasPrice={swapGasPriceinDollars}
            showDropdown={showExtraInfoDropdown}
        />
    );
}

export default memo(SwapExtraInfo);
