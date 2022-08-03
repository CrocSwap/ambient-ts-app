import { contractAddresses, tickToPrice, toDisplayPrice } from '@crocswap-libs/sdk';
import truncateDecimals from '../../utils/data/truncateDecimals';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { PositionIF } from '../../utils/state/graphDataSlice';

import { fetchAddress } from './fetchAddress';

export const getPositionData = async (position: PositionIF): Promise<PositionIF> => {
    position.base = position.base.startsWith('0x') ? position.base : '0x' + position.base;
    position.quote = position.quote.startsWith('0x') ? position.quote : '0x' + position.quote;
    position.user = position.user.startsWith('0x') ? position.user : '0x' + position.user;

    const baseTokenAddress = position.base;
    const quoteTokenAddress = position.quote;

    console.log({ position });

    // const poolPriceNonDisplay = await cachedQuerySpotPrice(
    //     baseTokenAddress,
    //     quoteTokenAddress,
    //     chainId,
    //     lastBlockNumber,
    // );

    const poolPriceNonDisplay = 0.001;

    try {
        const ensName = await fetchAddress(position.user);
        position.userEnsName = ensName ?? '';
    } catch (error) {
        console.log(error);
    }

    const poolPriceInTicks = Math.log(poolPriceNonDisplay) / Math.log(1.0001);

    // const baseTokenDecimals = await cachedGetTokenDecimals(baseTokenAddress);
    // const quoteTokenDecimals = await cachedGetTokenDecimals(quoteTokenAddress);
    const baseTokenDecimals = 18;
    const quoteTokenDecimals = 18;

    if (baseTokenDecimals) position.baseTokenDecimals = baseTokenDecimals;
    if (quoteTokenDecimals) position.quoteTokenDecimals = quoteTokenDecimals;

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

    const importedTokens: TokenIF[] = [];

    const baseTokenLogoURI = importedTokens.find(
        (token) => token.address.toLowerCase() === baseTokenAddress.toLowerCase(),
    )?.logoURI;
    const quoteTokenLogoURI = importedTokens.find(
        (token) => token.address.toLowerCase() === quoteTokenAddress.toLowerCase(),
    )?.logoURI;

    position.baseTokenLogoURI = baseTokenLogoURI ?? '';
    position.quoteTokenLogoURI = quoteTokenLogoURI ?? '';

    if (!position.ambient) {
        position.lowRangeDisplayInBase =
            lowerPriceDisplayInBase < 2
                ? truncateDecimals(lowerPriceDisplayInBase, 4).toString()
                : truncateDecimals(lowerPriceDisplayInBase, 2).toString();
        position.highRangeDisplayInBase =
            upperPriceDisplayInBase < 2
                ? truncateDecimals(upperPriceDisplayInBase, 4).toString()
                : truncateDecimals(upperPriceDisplayInBase, 2).toString();
    }

    if (!position.ambient) {
        position.lowRangeDisplayInQuote =
            lowerPriceDisplayInQuote < 2
                ? truncateDecimals(lowerPriceDisplayInQuote, 4).toString()
                : truncateDecimals(lowerPriceDisplayInQuote, 2).toString();
        position.highRangeDisplayInQuote =
            upperPriceDisplayInQuote < 2
                ? truncateDecimals(upperPriceDisplayInQuote, 4).toString()
                : truncateDecimals(upperPriceDisplayInQuote, 2).toString();
    }

    position.poolPriceInTicks = poolPriceInTicks;

    if (baseTokenAddress === contractAddresses.ZERO_ADDR) {
        position.baseTokenSymbol = 'ETH';
        position.quoteTokenSymbol = 'DAI';
        position.tokenAQtyDisplay = '1';
        position.tokenBQtyDisplay = '2000';
        // if (!position.ambient) {
        //     position.lowRangeDisplay = '.001';
        //     position.highRangeDisplay = '.002';
        // }
    } else if (
        baseTokenAddress.toLowerCase() ===
        '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa'.toLowerCase()
    ) {
        position.baseTokenSymbol = 'DAI';
        position.quoteTokenSymbol = 'USDC';
        position.tokenAQtyDisplay = '101';
        position.tokenBQtyDisplay = '100';
        // if (!position.ambient) {
        //     position.lowRangeDisplay = '0.9';
        //     position.highRangeDisplay = '1.1';
        // }
    } else {
        position.baseTokenSymbol = 'unknownBase';
        position.quoteTokenSymbol = 'unknownQuote';
    }
    return position;
};
