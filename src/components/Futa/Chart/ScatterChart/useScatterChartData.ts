import { useContext, useMemo } from 'react';
import { AuctionsContext } from '../../../../contexts/AuctionsContext';
import { toDisplayQty } from '@crocswap-libs/sdk';
import { marketCapMultiplier } from '../../../../pages/platformFuta/mockAuctionData';
import { ChainDataContext } from '../../../../contexts/ChainDataContext';
import { scatterDotDefaultSize } from './ScatterChart';

const useScatterChartData = () => {
    const { globalAuctionList } = useContext(AuctionsContext);
    const { nativeTokenUsdPrice } = useContext(ChainDataContext);

    const data = useMemo(() => {
        const localData = globalAuctionList.data?.map((element) => {
            const filledClearingPriceInEth = parseFloat(
                toDisplayQty(element.filledClearingPriceInNativeTokenWei, 18),
            );

            const marketCap = filledClearingPriceInEth * marketCapMultiplier;
            const marketCapUsdValue =
                nativeTokenUsdPrice !== undefined && marketCap !== undefined
                    ? nativeTokenUsdPrice * marketCap
                    : undefined;

            const currentTimeInSeconds = Math.floor(Date.now() / 1000);
            const auctionEndTime = element.createdAt + element.auctionLength;
            const timeRemainingInSec = auctionEndTime - currentTimeInSeconds;

            return {
                name: element.ticker,
                price: marketCapUsdValue ? marketCapUsdValue : 0,
                timeRemaining: timeRemainingInSec,
                size: scatterDotDefaultSize,
            };
        });

        if (localData) {
            return localData;
        }

        return [];
    }, [globalAuctionList]);

    return data;
};

export default useScatterChartData;
