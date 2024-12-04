import { memo, useContext } from 'react';
import { getFormattedNumber } from '../../../../ambient-utils/dataLayer';
import { PoolContext } from '../../../../contexts/PoolContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { ExtraInfo } from '../../TradeModules/ExtraInfo/ExtraInfo';
interface propsIF {
    poolPriceDisplay: string;
    slippageTolerance: number;
    liquidityFee: number | undefined;
    rangeGasPriceinDollars: string | undefined;
    isTokenABase: boolean;
    showExtraInfoDropdown: boolean;
    estRangeApr: number;
}

function RangeExtraInfo(props: propsIF) {
    const {
        rangeGasPriceinDollars,
        slippageTolerance,
        liquidityFee,
        showExtraInfoDropdown,
        estRangeApr,
    } = props;

    const { isDenomBase, baseToken, quoteToken } = useContext(TradeDataContext);

    const { poolPriceDisplay, isTradeDollarizationEnabled, usdPrice } =
        useContext(PoolContext);

    const baseTokenSymbol = baseToken.symbol;
    const quoteTokenSymbol = quoteToken.symbol;

    const aprPrecision =
        estRangeApr < 0.01
            ? 3
            : estRangeApr < 2
              ? 2
              : estRangeApr > 100
                ? 0
                : 1;

    const estRangeAprString = estRangeApr
        ? getFormattedNumber({
              value: estRangeApr,
              isPercentage: true,
              minFracDigits: aprPrecision,
              maxFracDigits: aprPrecision,
          }) + ' %'
        : '…';

    const displayPriceWithDenom =
        isDenomBase && poolPriceDisplay
            ? 1 / poolPriceDisplay
            : (poolPriceDisplay ?? 0);

    const displayPriceString = displayPriceWithDenom
        ? getFormattedNumber({
              value: displayPriceWithDenom,
          })
        : '…';

    const usdPriceDisplay = usdPrice
        ? getFormattedNumber({ value: usdPrice })
        : '…';

    const liquidityProviderFeeString = liquidityFee
        ? (liquidityFee * 100).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          }) + ' %'
        : '...';

    const extraInfo = [
        {
            title: 'Slippage Tolerance',
            tooltipTitle: 'This can be changed in settings.',
            data: `${slippageTolerance} %`,
        },
        {
            title: 'Current Provider Fee',
            tooltipTitle: `This is a dynamically updated rate to reward ${
                isDenomBase ? baseTokenSymbol : quoteTokenSymbol
            } / ${
                isDenomBase ? quoteTokenSymbol : baseTokenSymbol
            } liquidity providers.`,
            data: liquidityProviderFeeString,
        },
        {
            title: 'Estimated APR',
            tooltipTitle: `Estimated APR is based on selected range width, historical volume, fee rate, and pool
                liquidity. This value is only a historical estimate, and does not account
                for divergence loss from large price swings. 
                Very concentrated or unbalanced ranges are more likely to go out of range and not earn fees while out of range.
                Returns not guaranteed.`,
            data: estRangeAprString,
        },
    ];

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
            gasPrice={rangeGasPriceinDollars}
            showDropdown={showExtraInfoDropdown}
        />
    );
}

export default memo(RangeExtraInfo);
