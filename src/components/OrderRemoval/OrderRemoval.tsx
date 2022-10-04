import { useEffect, useState } from 'react';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import { useProcessOrder } from '../../utils/hooks/useProcessOrder';
import { ILimitOrderState } from '../../utils/state/graphDataSlice';
import RemoveOrderTokenHeader from './RemoveOrderHeader/RemoveOrderTokenHeader';
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
            {/* <div>Time Updated: {lastUpdatedTime}</div> */}
            <div>Owner: {userNameToDisplay}</div>
            <div>Base Token: {baseTokenSymbol}</div>
            <div>Quote Token: {quoteTokenSymbol}</div>
            <div>Low Price: {lowPriceDisplay}</div>
            <div>High Price: {highPriceDisplay}</div>
            <div>Bid Tick: {bidTick}</div>
            <div>Ask Tick: {askTick}</div>
            <div>Liquidity Base Qty: {posLiqBaseDecimalCorrected}</div>
            <div>Liquidity Quote Qty: {posLiqQuoteDecimalCorrected}</div>
            <div>Liquidity Wei Qty: {positionLiquidity}</div>
            {/* <div>Fees Base Qty: {feesBaseDecimalCorrected}</div>
            <div>Fees Quote Qty: {feesQuoteDecimalCorrected}</div> */}
            <div>Total Value USD: {positionLiqTotalUSD}</div>
        </div>
    );
}
