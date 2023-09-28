import { ambientPosSlot, concPosSlot } from '@crocswap-libs/sdk';

import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import getUnicodeCharacter from '../../utils/functions/getUnicodeCharacter';
import { PositionIF } from '../../utils/interfaces/exports';
import trimString from '../../utils/functions/trimString';
import { useMemo } from 'react';
import { getMoneynessRank } from '../functions/getMoneynessRank';
import { getChainExplorer } from '../data/chains';
import moment from 'moment';
import { getFormattedNumber } from '../../App/functions/getFormattedNumber';
import { getAddress } from 'ethers/lib/utils.js';

export const useProcessRange = (
    position: PositionIF,
    account = '',
    isAccountView?: boolean,
) => {
    const blockExplorer = getChainExplorer(position.chainId);

    const tradeData = useAppSelector((state) => state.tradeData);

    const poolPriceNonDisplay = tradeData.poolPriceNonDisplay;

    const isDenomBase = tradeData.isDenomBase;

    const tokenAAddress = position.base;
    const tokenBAddress = position.quote;
    // const tokenAAddress = tradeData.tokenA.address;
    // const tokenBAddress = tradeData.tokenB.address;

    const isBaseTokenMoneynessGreaterOrEqual = useMemo(
        () =>
            getMoneynessRank(position.baseSymbol) -
                getMoneynessRank(position.quoteSymbol) >=
            0,
        [position.base, position.base, position.chainId],
    );

    const baseQty = position.positionLiqBaseTruncated;

    const quoteQty = position.positionLiqQuoteTruncated;

    const baseTokenSymbol = position.baseSymbol;
    const quoteTokenSymbol = position.quoteSymbol;

    const baseTokenName = position.baseName;
    const quoteTokenName = position.quoteName;

    const quoteTokenLogo = position.quoteTokenLogoURI;
    const baseTokenLogo = position.baseTokenLogoURI;

    const apy = position.apy ?? undefined;
    const apyString = apy
        ? apy >= 1000
            ? apy.toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
              }) + '%+'
            : apy.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              }) + '%'
        : undefined;

    const apyClassname = apy > 0 ? 'apy_positive' : 'apy_negative';
    const isAmbient = position.positionType === 'ambient';

    const ensName = position.ensResolution ? position.ensResolution : null;
    const ownerId = position.user ? getAddress(position.user) : position.user;

    const isOwnerActiveAccount =
        position.user.toLowerCase() === account?.toLowerCase();

    // -------------------------------POSITION HASH------------------------

    let posHash;
    if (position.positionType == 'ambient') {
        posHash = ambientPosSlot(
            ownerId,
            position.base,
            position.quote,
            position.poolIdx,
        );
    } else {
        posHash =
            position.user &&
            position.base &&
            position.quote &&
            position.bidTick &&
            position.askTick
                ? concPosSlot(
                      position.user,
                      position.base,
                      position.quote,
                      position.bidTick,
                      position.askTick,
                      position.poolIdx,
                  ).toString()
                : '…';
    }

    // -----------------------------POSITIONS RANGE--------------------
    let isPositionInRange = position.isPositionInRange;

    const poolPriceInTicks = Math.log(poolPriceNonDisplay) / Math.log(1.0001);

    if (!isAccountView)
        isPositionInRange =
            position.positionType === 'ambient' ||
            (position.bidTick <= poolPriceInTicks &&
                poolPriceInTicks <= position.askTick);

    // --------------------SELECTED TOKEN FUNCTIONALITY---------------------------

    const positionBaseAddressLowerCase = position.base.toLowerCase();
    const positionQuoteAddressLowerCase = position.quote.toLowerCase();

    const tokenAAddressLowerCase = tokenAAddress.toLowerCase();
    const tokenBAddressLowerCase = tokenBAddress.toLowerCase();
    const baseTokenAddressTruncated = trimString(
        tokenAAddressLowerCase,
        6,
        4,
        '…',
    );
    const quoteTokenAddressTruncated = trimString(
        tokenBAddressLowerCase,
        6,
        4,
        '…',
    );

    const positionMatchesSelectedTokens =
        (positionBaseAddressLowerCase === tokenAAddressLowerCase ||
            positionQuoteAddressLowerCase === tokenAAddressLowerCase) &&
        (positionBaseAddressLowerCase === tokenBAddressLowerCase ||
            positionQuoteAddressLowerCase === tokenBAddressLowerCase);

    const accountAddress = account ? account.toLowerCase() : null;
    const userMatchesConnectedAccount =
        accountAddress === position.user.toLowerCase();
    // ---------------------------------POSITIONS MIN AND MAX RANGE--------------------

    const baseTokenCharacter = position.baseSymbol
        ? getUnicodeCharacter(position.baseSymbol)
        : '';
    const quoteTokenCharacter = position.quoteSymbol
        ? getUnicodeCharacter(position.quoteSymbol)
        : '';

    const minRange = isDenomBase
        ? position.lowRangeDisplayInBase
        : position.lowRangeDisplayInQuote;
    // const minRange = isDenomBase
    //     ? quoteTokenCharacter + position.lowRangeDisplayInBase
    //     : baseTokenCharacter + position.lowRangeDisplayInQuote;

    const minRangeDenomByMoneyness = isBaseTokenMoneynessGreaterOrEqual
        ? position.lowRangeDisplayInQuote
        : position.lowRangeDisplayInBase;

    const maxRangeDenomByMoneyness = isBaseTokenMoneynessGreaterOrEqual
        ? position.highRangeDisplayInQuote
        : position.highRangeDisplayInBase;

    const maxRange = isDenomBase
        ? position.highRangeDisplayInBase
        : position.highRangeDisplayInQuote;
    // const maxRange = isDenomBase
    //     ? quoteTokenCharacter + position.highRangeDisplayInBase
    //     : baseTokenCharacter + position.highRangeDisplayInQuote;

    const ambientOrMin = position.positionType === 'ambient' ? '0' : minRange;
    const ambientOrMax = position.positionType === 'ambient' ? '∞' : maxRange;

    const width = (position.askTick - position.bidTick) / 100;

    const usdValueNum = position.totalValueUSD;

    const usdValue = getFormattedNumber({
        value: usdValueNum,
    });

    const quantitiesAvailable = baseQty !== undefined || quoteQty !== undefined;

    const baseDisplayFrontend = quantitiesAvailable
        ? `${baseQty || '0.00'}`
        : '…';
    const baseDisplay = quantitiesAvailable ? baseQty || '0.00' : '…';

    const quoteDisplayFrontend = quantitiesAvailable
        ? `${quoteQty || '0.00'}`
        : '…';
    const quoteDisplay = quantitiesAvailable ? quoteQty || '0.00' : '…';

    const ensNameOrOwnerTruncated = ensName
        ? ensName.length > 16
            ? trimString(ensName, 11, 3, '…')
            : ensName
        : trimString(ownerId, 5, 4, '…');

    const posHashTruncated = trimString(posHash.toString(), 9, 0, '…');

    const userNameToDisplay = isOwnerActiveAccount
        ? 'You'
        : ensNameOrOwnerTruncated;

    const isPositionEmpty = position.positionLiq === 0;

    // if (!position) return null;

    const positionTime = position.latestUpdateTime || position.timeFirstMint;

    const elapsedTimeInSecondsNum = positionTime
        ? moment(Date.now()).diff(positionTime * 1000, 'seconds')
        : 0;

    const elapsedTimeString =
        elapsedTimeInSecondsNum !== undefined
            ? elapsedTimeInSecondsNum < 60
                ? '< 1 min. '
                : elapsedTimeInSecondsNum < 120
                ? '1 min. '
                : elapsedTimeInSecondsNum < 3600
                ? `${Math.floor(elapsedTimeInSecondsNum / 60)} min. `
                : elapsedTimeInSecondsNum < 7200
                ? '1 hour '
                : elapsedTimeInSecondsNum < 86400
                ? `${Math.floor(elapsedTimeInSecondsNum / 3600)} hrs. `
                : elapsedTimeInSecondsNum < 172800
                ? '1 day '
                : `${Math.floor(elapsedTimeInSecondsNum / 86400)} days `
            : 'Pending...';

    return {
        // wallet and id data
        ownerId,
        posHash,
        ensName,
        userMatchesConnectedAccount,
        posHashTruncated,
        userNameToDisplay,

        // Range min and max
        ambientOrMin,
        ambientOrMax,

        // value
        usdValue,

        // Token Qty data
        baseQty,
        quoteQty,
        baseTokenCharacter,
        quoteTokenCharacter,
        baseTokenAddressTruncated,
        quoteTokenAddressTruncated,
        baseTokenLogo,
        quoteTokenLogo,
        baseDisplayFrontend,
        quoteDisplayFrontend,
        baseTokenSymbol,
        quoteTokenSymbol,
        baseTokenName,
        quoteTokenName,
        baseDisplay,
        quoteDisplay,
        tokenAAddressLowerCase,
        tokenBAddressLowerCase,

        // apy
        apy,
        apyString,
        apyClassname,
        // range status
        isPositionInRange,
        isAmbient,
        isOwnerActiveAccount,
        isPositionEmpty,
        // position matches select token data
        positionMatchesSelectedTokens,
        isDenomBase,
        minRangeDenomByMoneyness,
        maxRangeDenomByMoneyness,
        isBaseTokenMoneynessGreaterOrEqual,
        width,
        blockExplorer,
        elapsedTimeString,
        baseTokenAddress: position.base,
        quoteTokenAddress: position.quote,
    };
};
