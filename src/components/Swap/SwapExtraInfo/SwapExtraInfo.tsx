import { memo, useContext } from 'react';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { CrocImpact } from '@crocswap-libs/sdk';
import { PoolContext } from '../../../contexts/PoolContext';
import { getPriceImpactString } from '../../../App/functions/swap/getPriceImpactString';
import { getFormattedNumber } from '../../../App/functions/getFormattedNumber';
import { ExtraInfo } from '../../Trade/TradeModules/ExtraInfo/ExtraInfo';

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

    const tradeData = useAppSelector((state) => state.tradeData);

    const isDenomBase = tradeData.isDenomBase;
    const baseTokenSymbol = tradeData.baseToken.symbol;
    const quoteTokenSymbol = tradeData.quoteToken.symbol;

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

    const priceImpactNum = !priceImpact?.percentChange
        ? undefined
        : Math.abs(priceImpact.percentChange) * 100;

    const extraInfo = [
        {
            title: 'Avg. Rate',
            tooltipTitle:
                'Expected Conversion Rate After Price Impact and Provider Fee',
            data: isDenomBase
                ? `${getFormattedNumber({
                      value: effectivePriceWithDenom,
                  })} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                : `${getFormattedNumber({
                      value: effectivePriceWithDenom,
                  })} ${baseTokenSymbol} per ${quoteTokenSymbol}`,
            placement: 'bottom',
        },
        {
            title: 'Final Price',
            tooltipTitle: 'Expected Pool Price After Swap',
            data: isDenomBase
                ? `${finalPriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                : `${finalPriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`,
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
            tooltipTitle: `This is a dynamically updated rate to reward ${baseTokenSymbol} / ${quoteTokenSymbol} liquidity providers.`,
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
