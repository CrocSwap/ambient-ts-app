import { toDisplayQty } from '@crocswap-libs/sdk';
import { useContext, useMemo } from 'react';
import {
    AuctionDataIF,
    getFormattedNumber,
} from '../../../../ambient-utils/dataLayer';
import { AuctionsContext } from '../../../../contexts/AuctionsContext';
import { ChainDataContext } from '../../../../contexts/ChainDataContext';
import { MARKET_CAP_MULTIPLIER_BIG_INT } from './../../../../pages/platformFuta/mockAuctionData';
import { scatterDotDefaultSize } from './ScatterChart';

const useScatterChartData = () => {
    const { globalAuctionList, filteredAuctionList, accountData } =
        useContext(AuctionsContext);
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

            const userBidData = accountData.auctions?.find(
                (val) => val.ticker === element.ticker,
            );

            const qtyBidByUserInWeiBigInt =
                userBidData?.qtyBidByUserInNativeTokenWei
                    ? BigInt(userBidData?.qtyBidByUserInNativeTokenWei)
                    : undefined;

            const qtyBidByUserInEthNum = qtyBidByUserInWeiBigInt
                ? parseFloat(toDisplayQty(qtyBidByUserInWeiBigInt, 18))
                : undefined;

            const formattedBidSizeEthValue = qtyBidByUserInEthNum
                ? getFormattedNumber({
                      value: qtyBidByUserInEthNum,
                      prefix: 'Ξ ',
                  })
                : '-';

            return {
                name: element.ticker,
                price: filledMarketCapUsdValue ? filledMarketCapUsdValue : 0,
                timeRemaining: timeRemainingInSec,
                userBidSize: formattedBidSizeEthValue,
                size: scatterDotDefaultSize,
                isShow: filteredAuctionList
                    ? filteredAuctionList.some(
                          (val: AuctionDataIF) => val.ticker === element.ticker,
                      )
                    : true,
            };
        });

        if (localData && nativeTokenUsdPrice) {
            return localData;
        }

        return [];
    }, [
        globalAuctionList,
        nativeTokenUsdPrice,
        filteredAuctionList,
        accountData,
    ]);

    return data;
};

export default useScatterChartData;
