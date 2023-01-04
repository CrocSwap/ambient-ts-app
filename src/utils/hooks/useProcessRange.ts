import { ambientPosSlot, concPosSlot } from '@crocswap-libs/sdk';

import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import getUnicodeCharacter from '../../utils/functions/getUnicodeCharacter';
import { formatAmountOld } from '../../utils/numbers';
import { PositionIF } from '../../utils/interfaces/PositionIF';
import trimString from '../../utils/functions/trimString';
import { useMemo } from 'react';
import { getMoneynessRank } from '../functions/getMoneynessRank';

export const useProcessRange = (position: PositionIF, account: string) => {
    const tradeData = useAppSelector((state) => state.tradeData);
    const isDenomBase = tradeData.isDenomBase;

    const tokenAAddress = tradeData.tokenA.address;
    const tokenBAddress = tradeData.tokenB.address;

    const isBaseTokenMoneynessGreaterOrEqual = useMemo(
        () =>
            getMoneynessRank(position.base.toLowerCase() + '_' + position.chainId) -
                getMoneynessRank(position.quote.toLowerCase() + '_' + position.chainId) >=
            0,
        [position.base, position.base, position.chainId],
    );

    const baseQty = position.positionLiqBaseTruncated;
    const quoteQty = position.positionLiqQuoteTruncated;

    const baseTokenSymbol = position.baseSymbol;
    const quoteTokenSymbol = position.quoteSymbol;

    const quoteTokenLogo = position.quoteTokenLogoURI;
    const baseTokenLogo = position.baseTokenLogoURI;

    const apy = position.apy ?? undefined;
    const apyString = apy
        ? apy.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          }) + '%'
        : undefined;

    const apyClassname = apy > 0 ? 'apy_positive' : 'apy_negative';
    const isAmbient = position.positionType === 'ambient';

    const ensName = position.ensResolution ? position.ensResolution : null;
    const ownerId = position.user.length === 40 ? '0x' + position.user : position.user;

    const isOwnerActiveAccount = position.user.toLowerCase() === account?.toLowerCase();

    // -------------------------------POSITION HASH------------------------

    let posHash;
    if (position.positionType == 'ambient') {
        posHash = ambientPosSlot(ownerId, position.base, position.quote, 36000);
    } else {
        posHash = concPosSlot(
            ownerId,
            position.base,
            position.quote,
            position.bidTick,
            position.askTick,
            36000,
        );
    }

    // -----------------------------POSITIONS RANGE--------------------
    const isPositionInRange = position.isPositionInRange;

    // --------------------SELECTED TOKEN FUNCTIONALITY---------------------------

    const positionBaseAddressLowerCase = position.base.toLowerCase();
    const positionQuoteAddressLowerCase = position.quote.toLowerCase();

    const tokenAAddressLowerCase = tokenAAddress.toLowerCase();
    const tokenBAddressLowerCase = tokenBAddress.toLowerCase();

    const positionMatchesSelectedTokens =
        (positionBaseAddressLowerCase === tokenAAddressLowerCase ||
            positionQuoteAddressLowerCase === tokenAAddressLowerCase) &&
        (positionBaseAddressLowerCase === tokenBAddressLowerCase ||
            positionQuoteAddressLowerCase === tokenBAddressLowerCase);

    const accountAddress = account ? account.toLowerCase() : null;
    const userMatchesConnectedAccount = accountAddress === position.user.toLowerCase();
    // ---------------------------------POSITIONS MIN AND MAX RANGE--------------------

    const baseTokenCharacter = position.baseSymbol ? getUnicodeCharacter(position.baseSymbol) : '';
    const quoteTokenCharacter = position.quoteSymbol
        ? getUnicodeCharacter(position.quoteSymbol)
        : '';

    const minRange = isDenomBase
        ? quoteTokenCharacter + position.lowRangeDisplayInBase
        : baseTokenCharacter + position.lowRangeDisplayInQuote;

    const minRangeDenomByMoneyness = isBaseTokenMoneynessGreaterOrEqual
        ? position.lowRangeDisplayInQuote
        : position.lowRangeDisplayInBase;

    const maxRangeDenomByMoneyness = isBaseTokenMoneynessGreaterOrEqual
        ? position.highRangeDisplayInQuote
        : position.highRangeDisplayInBase;

    const maxRange = isDenomBase
        ? quoteTokenCharacter + position.highRangeDisplayInBase
        : baseTokenCharacter + position.highRangeDisplayInQuote;

    const ambientMinOrNull = position.positionType === 'ambient' ? '0.00' : minRange;
    const ambientMaxOrNull = position.positionType === 'ambient' ? '∞' : maxRange;

    const usdValueNum = position.positionLiqTotalUSD;

    const usdValueTruncated = !usdValueNum
        ? undefined
        : usdValueNum < 0.001
        ? usdValueNum.toExponential(2) + ' '
        : usdValueNum >= 100000
        ? formatAmountOld(usdValueNum)
        : // ? baseLiqDisplayNum.toExponential(2)
          usdValueNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          }) + ' ';

    const usdValueLocaleString = !usdValueNum
        ? '…'
        : usdValueNum < 0.01
        ? usdValueNum.toPrecision(3)
        : // ? baseLiqDisplayNum.toExponential(2)
          usdValueNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    const quantitiesAvailable = baseQty !== undefined || quoteQty !== undefined;

    const baseDisplayFrontend = quantitiesAvailable
        ? `${baseTokenCharacter}${baseQty || '0.00'}`
        : '…';
    const baseDisplay = quantitiesAvailable ? baseQty || '0.00' : '…';

    const quoteDisplayFrontend = quantitiesAvailable
        ? `${quoteTokenCharacter}${quoteQty || '0.00'}`
        : '…';
    const quoteDisplay = quantitiesAvailable ? quoteQty || '0.00' : '…';

    const usdValue = usdValueTruncated ? usdValueTruncated : '…';

    const ensNameOrOwnerTruncated = ensName
        ? ensName.length > 10
            ? trimString(ensName, 5, 3, '…')
            : ensName
        : trimString(ownerId, 6, 0, '…');
    const posHashTruncated = trimString(posHash.toString(), 6, 0, '…');

    const userNameToDisplay = isOwnerActiveAccount ? 'You' : ensNameOrOwnerTruncated;

    // if (!position) return null;

    return {
        // wallet and id data
        ownerId,
        posHash,
        ensName,
        userMatchesConnectedAccount,
        posHashTruncated,
        userNameToDisplay,

        // Range min and max
        ambientMinOrNull,
        ambientMaxOrNull,

        // value
        usdValue,
        usdValueLocaleString,

        // Token Qty data
        baseQty,
        quoteQty,
        baseTokenCharacter,
        quoteTokenCharacter,
        baseTokenLogo,
        quoteTokenLogo,
        baseDisplayFrontend,
        quoteDisplayFrontend,
        baseTokenSymbol,
        quoteTokenSymbol,
        baseDisplay,
        quoteDisplay,

        // apy
        apy,
        apyString,
        apyClassname,

        // range status
        isPositionInRange,
        isAmbient,
        isOwnerActiveAccount,

        // position matches select token data
        positionMatchesSelectedTokens,
        isDenomBase,
        minRangeDenomByMoneyness,
        maxRangeDenomByMoneyness,
        isBaseTokenMoneynessGreaterOrEqual,
    };
};
