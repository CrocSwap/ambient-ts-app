import { ambientPosSlot, concPosSlot } from '@crocswap-libs/sdk';

import { useMoralis } from 'react-moralis';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import getUnicodeCharacter from '../../utils/functions/getUnicodeCharacter';
import { formatAmount } from '../../utils/numbers';
import { PositionIF } from '../../utils/interfaces/PositionIF';
import trimString from '../../utils/functions/trimString';

export const useProcessRange = (position: PositionIF) => {
    const { account } = useMoralis();
    const tradeData = useAppSelector((state) => state.tradeData);
    const isDenomBase = tradeData.isDenomBase;

    const tokenAAddress = tradeData.tokenA.address;
    const tokenBAddress = tradeData.tokenB.address;

    const baseQty = position.positionLiqBaseTruncated;
    const quoteQty = position.positionLiqQuoteTruncated;

    const baseTokenSymbol = tradeData.baseToken.symbol;
    const quoteTokenSymbol = tradeData.quoteToken.symbol;

    const quoteTokenLogo = tradeData.quoteToken.logoURI;
    const baseTokenLogo = tradeData.baseToken.logoURI;

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
    const ownerId = position.user;

    const isOwnerActiveAccount = position.user.toLowerCase() === account?.toLowerCase();

    // -------------------------------POSITION HASH------------------------

    let posHash;
    if (position.positionType == 'ambient') {
        posHash = ambientPosSlot(position.user, position.base, position.quote, 36000);
    } else {
        posHash = concPosSlot(
            position.user,
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
    const maxRange = isDenomBase
        ? quoteTokenCharacter + position.highRangeDisplayInBase
        : baseTokenCharacter + position.highRangeDisplayInQuote;

    const ambientMinOrNull = position.positionType === 'ambient' ? '0.00' : minRange;
    const ambientMaxOrNull = position.positionType === 'ambient' ? '∞' : maxRange;

    const usdValueNum = position.positionLiqTotalUSD;

    const usdValueTruncated = !usdValueNum
        ? undefined
        : usdValueNum < 0.0001
        ? usdValueNum.toExponential(2)
        : usdValueNum < 2
        ? usdValueNum.toPrecision(3)
        : usdValueNum >= 100000
        ? formatAmount(usdValueNum)
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

        // position matches select token data
        positionMatchesSelectedTokens,
        isDenomBase,
    };
};
