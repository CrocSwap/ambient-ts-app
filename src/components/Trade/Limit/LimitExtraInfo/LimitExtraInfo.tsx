import { memo, useContext } from 'react';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { PoolContext } from '../../../../contexts/PoolContext';
import { getFormattedNumber } from '../../../../App/functions/getFormattedNumber';
import { ExtraInfo } from '../../TradeModules/ExtraInfo/ExtraInfo';

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

    const conversionRate = isDenomBase
        ? `1 ${baseTokenSymbol} ≈ ${displayPriceString} ${quoteTokenSymbol}`
        : `1 ${quoteTokenSymbol} ≈ ${displayPriceString} ${baseTokenSymbol}`;

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
