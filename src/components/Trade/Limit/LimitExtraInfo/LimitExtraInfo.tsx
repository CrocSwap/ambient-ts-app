import { memo, useContext } from 'react';
import { PoolContext } from '../../../../contexts/PoolContext';
import { getFormattedNumber } from '../../../../ambient-utils/dataLayer';
import { ExtraInfo } from '../../TradeModules/ExtraInfo/ExtraInfo';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';

interface propsIF {
    orderGasPriceInDollars: string | undefined;
    isTokenABase: boolean;
    startDisplayPrice: number;
    middleDisplayPrice: number;
    endDisplayPrice: number;
    showExtraInfoDropdown: boolean;
    liquidityProviderFeeString: string;
}

function LimitExtraInfo(props: propsIF) {
    const {
        orderGasPriceInDollars,
        startDisplayPrice,
        middleDisplayPrice,
        endDisplayPrice,
        showExtraInfoDropdown,
        liquidityProviderFeeString,
    } = props;
    const { poolPriceDisplay, isTradeDollarizationEnabled, usdPrice } =
        useContext(PoolContext);

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

    const usdPriceDisplay = usdPrice
        ? getFormattedNumber({ value: usdPrice })
        : '…';

    const startPriceString = getFormattedNumber({
        value: startDisplayPrice,
    });
    const middlePriceString = getFormattedNumber({
        value: middleDisplayPrice,
    });
    const endPriceString = getFormattedNumber({
        value: endDisplayPrice,
    });

    const extraInfo = [
        {
            title: 'Fill Start',
            tooltipTitle:
                'Price at which the limit order will begin to be filled',
            data: isDenomBase
                ? `${startPriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                : `${startPriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`,
        },
        {
            title: 'Fill Middle',
            tooltipTitle:
                'Average price at which the limit order will be filled',
            data: isDenomBase
                ? `${middlePriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                : `${middlePriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`,
        },
        {
            title: 'Fill End',
            tooltipTitle:
                'Price at which the limit order will finish being filled and become claimable',
            data: isDenomBase
                ? `${endPriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                : `${endPriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`,
        },
        {
            title: 'Minimum Rebate Rate',
            tooltipTitle:
                'The minimum provider fee for swaps in this pool. Provider fees are effectively rebated for limit orders.',
            data: '0.05%',
        },
        {
            title: 'Current Rebate Rate',
            tooltipTitle:
                'The current provider fee for swaps. Provider fees are effectively rebated for limit orders.',
            data: `${liquidityProviderFeeString}%`,
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
