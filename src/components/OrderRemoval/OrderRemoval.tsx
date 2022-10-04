import { useEffect, useState } from 'react';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import { useProcessOrder } from '../../utils/hooks/useProcessOrder';
import { ILimitOrderState } from '../../utils/state/graphDataSlice';
import RemoveOrderTokenHeader from './RemoveOrderHeader/RemoveOrderTokenHeader';
import RemoveOrderInfo from './RemoveOrderInfo/RemoveOrderInfo';
import RemoveOrderWidth from './RemoveOrderWidth/RemoveOrderWidth';

interface IOrderRemovalProps {
    limitOrder: ILimitOrderState;
}

export default function OrderRemoval(props: IOrderRemovalProps) {
    const { limitOrder } = props;
    const {
        posLiqBaseDecimalCorrected,
        posLiqQuoteDecimalCorrected,
        lowPriceDisplay,
        highPriceDisplay,
        bidTick,
        askTick,
        positionLiquidity,
        positionLiqTotalUSD,
        userNameToDisplay,
        baseTokenSymbol,
        quoteTokenSymbol,
        isOrderFilled,
        isDenomBase,
        baseTokenLogo,
        quoteTokenLogo,
        usdValue,
        baseDisplayFrontend,
        quoteDisplayFrontend,
    } = useProcessOrder(limitOrder);

    const [removalPercentage, setRemovalPercentage] = useState(100);

    return (
        <div>
            <RemoveOrderTokenHeader
                isDenomBase={isDenomBase}
                isOrderFilled={isOrderFilled}
                baseTokenSymbol={baseTokenSymbol}
                quoteTokenSymbol={quoteTokenSymbol}
                baseTokenLogoURI={baseTokenLogo}
                quoteTokenLogoURI={quoteTokenLogo}
            />
            <RemoveOrderWidth
                removalPercentage={removalPercentage}
                setRemovalPercentage={setRemovalPercentage}
            />
            <RemoveOrderInfo
                baseTokenSymbol={baseTokenSymbol}
                quoteTokenSymbol={quoteTokenSymbol}
                baseTokenLogoURI={baseTokenLogo}
                quoteTokenLogoURI={quoteTokenLogo}
                posLiqBaseDecimalCorrected={posLiqBaseDecimalCorrected}
                posLiqQuoteDecimalCorrected={posLiqQuoteDecimalCorrected}
                removalPercentage={removalPercentage}
                usdValue={usdValue}
                bidTick={bidTick}
                askTick={askTick}
                baseDisplayFrontend={baseDisplayFrontend}
                quoteDisplayFrontend={quoteDisplayFrontend}
                positionLiqTotalUSD={positionLiqTotalUSD}
                positionLiquidity={positionLiquidity}
            />
        </div>
    );
}
