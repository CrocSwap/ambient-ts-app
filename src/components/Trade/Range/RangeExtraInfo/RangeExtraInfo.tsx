import { memo } from 'react';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { ExtraInfo } from '../../TradeModules/ExtraInfo/ExtraInfo';
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

    const { isDenomBase, tokenA, tokenB, baseToken, quoteToken } =
        useAppSelector((state) => state.tradeData);

    const baseTokenSymbol = baseToken.symbol;
    const quoteTokenSymbol = quoteToken.symbol;

    const reverseDisplay =
        (isTokenABase && !isDenomBase) || (!isTokenABase && isDenomBase);

    const extraInfo = [
        {
            title: 'Slippage Tolerance',
            tooltipTitle: 'This can be changed in settings.',
            data: `±${slippageTolerance}%`,
        },
        {
            title: 'Current Provider Fee',
            tooltipTitle: `This is a dynamically updated rate to reward ${
                isDenomBase ? baseTokenSymbol : quoteTokenSymbol
            } / ${
                isDenomBase ? quoteTokenSymbol : baseTokenSymbol
            } liquidity providers.`,
            data: `${liquidityProviderFeeString}%`,
        },
    ];

    const conversionRate = reverseDisplay
        ? `1 ${tokenB.symbol} ≈ ${poolPriceDisplay} ${tokenA.symbol}`
        : `1 ${tokenA.symbol} ≈ ${poolPriceDisplay} ${tokenB.symbol}`;

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
