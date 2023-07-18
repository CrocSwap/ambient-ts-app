import { memo } from 'react';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { TradeModuleExtraInfo } from '../../TradeModules/TradeModuleExtraInfo';
interface propsIF {
    poolPriceDisplay: string;
    slippageTolerance: number;
    liquidityProviderFeeString: string;
    rangeGasPriceinDollars: string | undefined;
    isTokenABase: boolean;
    showExtraInfoDropdown: boolean;
}

function RangeExtraInfo(props: propsIF) {
    const {
        rangeGasPriceinDollars,
        poolPriceDisplay,
        slippageTolerance,
        liquidityProviderFeeString,
        isTokenABase,
        showExtraInfoDropdown,
    } = props;

    const { isDenomBase, tokenA, tokenB } = useAppSelector(
        (state) => state.tradeData,
    );

    const reverseDisplay =
        (isTokenABase && !isDenomBase) || (!isTokenABase && isDenomBase);

    const extraInfo = [
        {
            title: 'Spot Price',
            tooltipTitle: 'spot price explanation',
            data: reverseDisplay
                ? `${poolPriceDisplay} ${tokenA.symbol} per ${tokenB.symbol}`
                : `${poolPriceDisplay} ${tokenB.symbol} per ${tokenA.symbol}`,
        },
        {
            title: 'Slippage Tolerance',
            tooltipTitle: 'slippage tolerance explanation',
            data: `±${slippageTolerance}%`,
        },
        {
            title: 'Current Provider Fee',
            tooltipTitle: 'liquidity provider fee explanation',
            data: `${liquidityProviderFeeString}%`,
        },
    ];

    const conversionRate = reverseDisplay
        ? `1 ${tokenB.symbol} ≈ ${poolPriceDisplay} ${tokenA.symbol}`
        : `1 ${tokenA.symbol} ≈ ${poolPriceDisplay} ${tokenB.symbol}`;

    return (
        <TradeModuleExtraInfo
            extraInfo={extraInfo}
            conversionRate={conversionRate}
            gasPrice={rangeGasPriceinDollars}
            showDropdown={showExtraInfoDropdown}
        />
    );
}

export default memo(RangeExtraInfo);
