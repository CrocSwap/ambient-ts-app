import { memo, useContext } from 'react';
import { getFormattedNumber } from '../../../../ambient-utils/dataLayer';
import { PoolContext } from '../../../../contexts/PoolContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { ExtraInfo } from '../../TradeModules/ExtraInfo/ExtraInfo';

interface propsIF {
    orderGasPriceInDollars: string | undefined;
    isTokenABase: boolean;
    startDisplayPrice: number | undefined;
    middleDisplayPrice: number | undefined;
    endDisplayPrice: number | undefined;
    showExtraInfoDropdown: boolean;
    liquidityFee: number | undefined;
}

function LimitExtraInfo(props: propsIF) {
    const {
        orderGasPriceInDollars,
        startDisplayPrice,
        middleDisplayPrice,
        endDisplayPrice,
        showExtraInfoDropdown,
        liquidityFee,
    } = props;
    const {
        poolPriceDisplay,
        isTradeDollarizationEnabled,
        usdPrice,
        basePrice,
        quotePrice,
    } = useContext(PoolContext);

    const { baseToken, quoteToken, isDenomBase } = useContext(TradeDataContext);

    const baseTokenSymbol = baseToken.symbol;
    const quoteTokenSymbol = quoteToken.symbol;

    const displayPriceWithDenom =
        isDenomBase && poolPriceDisplay
            ? 1 / poolPriceDisplay
            : (poolPriceDisplay ?? 0);

    const displayPriceString = displayPriceWithDenom
        ? getFormattedNumber({
              value: displayPriceWithDenom,
          })
        : '…';

    const startPriceInUsdOrToken = startDisplayPrice
        ? isTradeDollarizationEnabled
            ? startDisplayPrice *
              (isDenomBase ? quotePrice || 1 : basePrice || 1)
            : startDisplayPrice
        : 1;

    const middlePriceInUsdOrToken = middleDisplayPrice
        ? isTradeDollarizationEnabled
            ? middleDisplayPrice *
              (isDenomBase ? quotePrice || 1 : basePrice || 1)
            : middleDisplayPrice
        : 1;

    const endPriceInUsdOrToken = endDisplayPrice
        ? isTradeDollarizationEnabled
            ? endDisplayPrice * (isDenomBase ? quotePrice || 1 : basePrice || 1)
            : endDisplayPrice
        : 1;

    const usdPriceDisplay = usdPrice
        ? getFormattedNumber({ value: usdPrice })
        : '…';

    const startPriceString = startPriceInUsdOrToken
        ? getFormattedNumber({
              value: startPriceInUsdOrToken,
          })
        : '...';

    const middlePriceString = middlePriceInUsdOrToken
        ? getFormattedNumber({
              value: middlePriceInUsdOrToken,
          })
        : '...';

    const endPriceString = endPriceInUsdOrToken
        ? getFormattedNumber({
              value: endPriceInUsdOrToken,
          })
        : '...';

    const liquidityProviderFeeString = liquidityFee
        ? (liquidityFee * 100).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          }) + ' %'
        : '...';

    const extraInfo = [
        {
            title: 'Fill Start',
            tooltipTitle:
                'Price at which the limit order will begin to be filled',
            data: isDenomBase
                ? `${startPriceString} ${isTradeDollarizationEnabled ? 'USD' : quoteTokenSymbol} per ${baseTokenSymbol}`
                : `${startPriceString} ${isTradeDollarizationEnabled ? 'USD' : baseTokenSymbol} per ${quoteTokenSymbol}`,
        },
        {
            title: 'Fill Middle',
            tooltipTitle:
                'Average price at which the limit order will be filled',
            data: isDenomBase
                ? `${middlePriceString} ${isTradeDollarizationEnabled ? 'USD' : quoteTokenSymbol} per ${baseTokenSymbol}`
                : `${middlePriceString} ${isTradeDollarizationEnabled ? 'USD' : baseTokenSymbol} per ${quoteTokenSymbol}`,
        },
        {
            title: 'Fill End',
            tooltipTitle:
                'Price at which the limit order will finish being filled and become claimable',
            data: isDenomBase
                ? `${endPriceString} ${isTradeDollarizationEnabled ? 'USD' : quoteTokenSymbol} per ${baseTokenSymbol}`
                : `${endPriceString} ${isTradeDollarizationEnabled ? 'USD' : baseTokenSymbol} per ${quoteTokenSymbol}`,
        },
        {
            title: 'Minimum Rebate Rate',
            tooltipTitle:
                'The minimum provider fee for swaps in this pool. Provider fees are effectively rebated for limit orders.',
            data: liquidityFee ? '0.05 %' : '...',
        },
        {
            title: 'Current Rebate Rate',
            tooltipTitle:
                'The current provider fee for swaps. Provider fees are effectively rebated for limit orders.',
            data: liquidityProviderFeeString,
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
            gasPrice={orderGasPriceInDollars}
            showDropdown={showExtraInfoDropdown}
        />
    );
}

export default memo(LimitExtraInfo);
