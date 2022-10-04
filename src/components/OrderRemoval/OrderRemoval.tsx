import { useState } from 'react';
import { useProcessOrder } from '../../utils/hooks/useProcessOrder';
import { ILimitOrderState } from '../../utils/state/graphDataSlice';
import RemoveOrderButton from './RemoveOrderButton/RemoveOrderButton';
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
        // lowPriceDisplay,
        // highPriceDisplay,
        bidTick,
        askTick,
        positionLiquidity,
        positionLiqTotalUSD,
        // userNameToDisplay,
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

    const removeFn = () => console.log('order removed');

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
            <RemoveOrderButton removeFn={removeFn} disabled={true} title='…' />
        </div>
    );
}
