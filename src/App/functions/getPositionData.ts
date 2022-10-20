import { CrocEnv, tickToPrice, toDisplayPrice } from '@crocswap-libs/sdk';
// import truncateDecimals from '../../utils/data/truncateDecimals';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { PositionIF } from '../../utils/interfaces/PositionIF';
import { formatAmount } from '../../utils/numbers';
// import { ethers } from 'ethers';
import { memoizeQuerySpotPrice } from './querySpotPrice';

// import { fetchAddress } from './fetchAddress';
const cachedQuerySpotPrice = memoizeQuerySpotPrice();

export const getPositionData = async (
    position: PositionIF,
    importedTokens: TokenIF[],
    crocEnv: CrocEnv,
    chainId: string,
    lastBlockNumber: number,
): Promise<PositionIF> => {
    const newPosition = { ...position };

    const baseTokenAddress = position.base.length === 40 ? '0x' + position.base : position.base;
    const quoteTokenAddress = position.quote.length === 40 ? '0x' + position.quote : position.quote;

    const poolPriceNonDisplay = await cachedQuerySpotPrice(
        crocEnv,
        baseTokenAddress,
        quoteTokenAddress,
        chainId,
        lastBlockNumber,
    );

    const poolPriceInTicks = Math.log(poolPriceNonDisplay) / Math.log(1.0001);
    newPosition.poolPriceInTicks = poolPriceInTicks;

    const isPositionInRange =
        position.positionType === 'ambient' ||
        (position.bidTick <= poolPriceInTicks && poolPriceInTicks <= position.askTick);

    newPosition.isPositionInRange = isPositionInRange;

    const baseTokenDecimals = position.baseDecimals;
    const quoteTokenDecimals = position.quoteDecimals;

    const lowerPriceNonDisplay = tickToPrice(position.bidTick);
    const upperPriceNonDisplay = tickToPrice(position.askTick);

    const lowerPriceDisplayInBase =
        1 / toDisplayPrice(upperPriceNonDisplay, baseTokenDecimals, quoteTokenDecimals);

    const upperPriceDisplayInBase =
        1 / toDisplayPrice(lowerPriceNonDisplay, baseTokenDecimals, quoteTokenDecimals);

    const lowerPriceDisplayInQuote = toDisplayPrice(
        lowerPriceNonDisplay,
        baseTokenDecimals,
        quoteTokenDecimals,
    );

    const upperPriceDisplayInQuote = toDisplayPrice(
        upperPriceNonDisplay,
        baseTokenDecimals,
        quoteTokenDecimals,
    );

    newPosition.lowRangeShortDisplayInBase =
        lowerPriceDisplayInBase < 0.0001
            ? lowerPriceDisplayInBase.toExponential(2)
            : lowerPriceDisplayInBase < 2
            ? lowerPriceDisplayInBase.toPrecision(3)
            : lowerPriceDisplayInBase >= 1000000
            ? lowerPriceDisplayInBase.toExponential(2)
            : lowerPriceDisplayInBase.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
              });

    newPosition.lowRangeShortDisplayInQuote =
        lowerPriceDisplayInQuote < 0.0001
            ? lowerPriceDisplayInQuote.toExponential(2)
            : lowerPriceDisplayInQuote < 2
            ? lowerPriceDisplayInQuote.toPrecision(3)
            : lowerPriceDisplayInQuote >= 1000000
            ? lowerPriceDisplayInQuote.toExponential(2)
            : lowerPriceDisplayInQuote.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
              });

    newPosition.highRangeShortDisplayInBase =
        upperPriceDisplayInBase < 0.0001
            ? upperPriceDisplayInBase.toExponential(2)
            : upperPriceDisplayInBase < 2
            ? upperPriceDisplayInBase.toPrecision(3)
            : upperPriceDisplayInBase >= 1000000
            ? upperPriceDisplayInBase.toExponential(2)
            : upperPriceDisplayInBase.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
              });

    newPosition.highRangeShortDisplayInQuote =
        upperPriceDisplayInQuote < 0.0001
            ? upperPriceDisplayInQuote.toExponential(2)
            : upperPriceDisplayInQuote < 2
            ? upperPriceDisplayInQuote.toPrecision(3)
            : upperPriceDisplayInQuote >= 1000000
            ? upperPriceDisplayInQuote.toExponential(2)
            : upperPriceDisplayInQuote.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
              });

    const baseTokenLogoURI = importedTokens.find(
        (token) => token.address.toLowerCase() === baseTokenAddress.toLowerCase(),
    )?.logoURI;
    const quoteTokenLogoURI = importedTokens.find(
        (token) => token.address.toLowerCase() === quoteTokenAddress.toLowerCase(),
    )?.logoURI;

    newPosition.baseTokenLogoURI = baseTokenLogoURI ?? '';
    newPosition.quoteTokenLogoURI = quoteTokenLogoURI ?? '';

    if (position.positionType !== 'ambient') {
        newPosition.lowRangeDisplayInBase =
            lowerPriceDisplayInBase < 0.0001
                ? lowerPriceDisplayInBase.toExponential(2)
                : lowerPriceDisplayInBase < 2
                ? lowerPriceDisplayInBase.toPrecision(3)
                : lowerPriceDisplayInBase >= 1000000
                ? lowerPriceDisplayInBase.toExponential(2)
                : lowerPriceDisplayInBase.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  });
        newPosition.highRangeDisplayInBase =
            upperPriceDisplayInBase < 0.0001
                ? upperPriceDisplayInBase.toExponential(2)
                : upperPriceDisplayInBase < 2
                ? upperPriceDisplayInBase.toPrecision(3)
                : upperPriceDisplayInBase >= 1000000
                ? upperPriceDisplayInBase.toExponential(2)
                : upperPriceDisplayInBase.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  });
    }

    if (position.positionType !== 'ambient') {
        newPosition.lowRangeDisplayInQuote =
            lowerPriceDisplayInQuote < 0.0001
                ? lowerPriceDisplayInQuote.toExponential(2)
                : lowerPriceDisplayInQuote < 2
                ? lowerPriceDisplayInQuote.toPrecision(3)
                : lowerPriceDisplayInQuote >= 1000000
                ? lowerPriceDisplayInQuote.toExponential(2)
                : lowerPriceDisplayInQuote.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  });
        newPosition.highRangeDisplayInQuote =
            upperPriceDisplayInQuote < 0.0001
                ? upperPriceDisplayInQuote.toExponential(2)
                : upperPriceDisplayInQuote < 2
                ? upperPriceDisplayInQuote.toPrecision(3)
                : upperPriceDisplayInQuote >= 1000000
                ? upperPriceDisplayInQuote.toExponential(2)
                : upperPriceDisplayInQuote.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  });
    }

    if (position.positionLiqBaseDecimalCorrected) {
        const liqBaseNum = position.positionLiqBaseDecimalCorrected;

        const baseLiqDisplayTruncated =
            liqBaseNum === 0
                ? '0'
                : liqBaseNum < 0.0001
                ? liqBaseNum.toExponential(2)
                : liqBaseNum < 2
                ? liqBaseNum.toPrecision(3)
                : liqBaseNum >= 100000
                ? formatAmount(liqBaseNum)
                : // ? baseLiqDisplayNum.toExponential(2)
                  liqBaseNum.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  });

        newPosition.positionLiqBaseTruncated = baseLiqDisplayTruncated;
    }
    if (position.positionLiqQuoteDecimalCorrected) {
        const liqQuoteNum = position.positionLiqQuoteDecimalCorrected;

        const quoteLiqDisplayTruncated =
            liqQuoteNum === 0
                ? '0'
                : liqQuoteNum < 0.0001
                ? liqQuoteNum.toExponential(2)
                : liqQuoteNum < 2
                ? liqQuoteNum.toPrecision(3)
                : liqQuoteNum >= 100000
                ? formatAmount(liqQuoteNum)
                : // ? quoteLiqDisplayNum.toExponential(2)
                  liqQuoteNum.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  });
        newPosition.positionLiqQuoteTruncated = quoteLiqDisplayTruncated;
    }

    return newPosition;
};

export const updateApy = async (position: PositionIF): Promise<PositionIF> => {
    const httpGraphCacheServerDomain = 'https://809821320828123.de:5000';
    const positionApyCacheEndpoint = httpGraphCacheServerDomain + '/position_apy?';

    // console.log('fetching position apy');

    const updatedPosition = await fetch(
        positionApyCacheEndpoint +
            new URLSearchParams({
                user: position.user.length === 40 ? '0x' + position.user : position.user,
                askTick: position.askTick.toString(),
                bidTick: position.bidTick.toString(),
                base: position.base.length === 40 ? '0x' + position.base : position.base,
                quote: position.quote.length === 40 ? '0x' + position.quote : position.quote,
                poolIdx: position.poolIdx.toString(),
                chainId: position.chainId,
                // chainId: position.chainId,
                positionType: position.positionType,
                concise: 'true',
            }),
    )
        .then((response) => response?.json())
        .then((json) => {
            const apy = json?.data.results.apy;

            if (apy) {
                return Object.assign({}, position, { apy: apy });
            }
        })

        .catch(console.log);

    return updatedPosition || position;
};
