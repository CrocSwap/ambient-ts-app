import { MARKET_CAP_MULTIPLIER_BIG_INT } from './../../../../pages/platformFuta/mockAuctionData';
import { useContext, useMemo } from 'react';
import { AuctionsContext } from '../../../../contexts/AuctionsContext';
import { toDisplayQty } from '@crocswap-libs/sdk';
import { ChainDataContext } from '../../../../contexts/ChainDataContext';
import { scatterDotDefaultSize } from './ScatterChart';

const useScatterChartData = () => {
    const { globalAuctionList } = useContext(AuctionsContext);
    const { nativeTokenUsdPrice } = useContext(ChainDataContext);

    const data = useMemo(() => {
        const localData = globalAuctionList.data?.map((element) => {
            const filledClearingPriceInWeiBigInt =
                element.filledClearingPriceInNativeTokenWei
                    ? BigInt(element.filledClearingPriceInNativeTokenWei)
                    : undefined;
            const filledMarketCapInWeiBigInt = filledClearingPriceInWeiBigInt
                ? filledClearingPriceInWeiBigInt * MARKET_CAP_MULTIPLIER_BIG_INT
                : undefined;
            const filledMarketCapInEth = filledMarketCapInWeiBigInt
                ? toDisplayQty(filledMarketCapInWeiBigInt, 18)
                : undefined;
            const filledMarketCapUsdValue =
                nativeTokenUsdPrice !== undefined &&
                filledMarketCapInEth !== undefined
                    ? nativeTokenUsdPrice * parseFloat(filledMarketCapInEth)
                    : undefined;

            const currentTimeInSeconds = Math.floor(Date.now() / 1000);
            const auctionEndTime = element.createdAt + element.auctionLength;
            const timeRemainingInSec = auctionEndTime - currentTimeInSeconds;

            return {
                name: element.ticker,
                price: filledMarketCapUsdValue ? filledMarketCapUsdValue : 0,
                timeRemaining: timeRemainingInSec,
                size: scatterDotDefaultSize,
            };
        });

        if (localData && nativeTokenUsdPrice) {
            return localData;
        }

        return [];
    }, [globalAuctionList, nativeTokenUsdPrice]);

    return data;
};

export default useScatterChartData;
