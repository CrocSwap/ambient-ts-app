import {
    getChainExplorer,
    getUnicodeCharacter,
    trimString,
    getMoneynessRank,
    getFormattedNumber,
} from '../../ambient-utils/dataLayer';
import { PositionIF } from '../../ambient-utils/types';
import { useContext, useMemo } from 'react';
import moment from 'moment';
import { TradeDataContext } from '../../contexts/TradeDataContext';
import { useFetchBatch } from '../../App/hooks/useFetchBatch';
import { UserDataContext } from '../../contexts/UserDataContext';
import { getPositionHash } from '../../ambient-utils/dataLayer/functions/getPositionHash';

export const useProcessRange = (
    position: PositionIF,
    account = '',
    isAccountView?: boolean,
) => {
    const blockExplorer = getChainExplorer(position.chainId);

    const { isDenomBase, poolPriceNonDisplay } = useContext(TradeDataContext);
    const { ensName: ensNameConnectedUser } = useContext(UserDataContext);

    const tokenAAddress = position.base;
    const tokenBAddress = position.quote;

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

    /* eslint-disable-next-line camelcase */
    const body = { config_path: 'ens_address', address: position.user };
    const { data, error } = useFetchBatch<'ens_address'>(body);

    let ensAddress = null;
    if (data && !error) {
        // prevent showing ens address if it is the same as the connected user due to async issue when switching tables
        ensAddress =
            data.ens_address !== ensNameConnectedUser
                ? data.ens_address
                : undefined;
    }

    const ensName = ensAddress
        ? ensAddress
        : position.ensResolution
        ? position.ensResolution
        : null;

    // const ownerId = position.user ? getAddress(position.user) : position.user;

    const isOwnerActiveAccount =
        position.user.toLowerCase() === account?.toLowerCase();

    // -------------------------------POSITION HASH------------------------

    const posHash = getPositionHash(position);
    const serverPositionId = position.serverPositionId;

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
        prefix: '$',
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
        : trimString(position.user, 6, 4, '…');

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

    const elapsedTimeSinceFirstMintInSecondsNum = position.timeFirstMint
        ? moment(Date.now()).diff(position.timeFirstMint * 1000, 'seconds')
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

    const elapsedTimeSinceFirstMintString =
        elapsedTimeSinceFirstMintInSecondsNum !== undefined
            ? elapsedTimeSinceFirstMintInSecondsNum < 60
                ? '< 1 min. '
                : elapsedTimeSinceFirstMintInSecondsNum < 120
                ? '1 min. '
                : elapsedTimeSinceFirstMintInSecondsNum < 3600
                ? `${Math.floor(
                      elapsedTimeSinceFirstMintInSecondsNum / 60,
                  )} min. `
                : elapsedTimeSinceFirstMintInSecondsNum < 7200
                ? '1 hour '
                : elapsedTimeSinceFirstMintInSecondsNum < 86400
                ? `${Math.floor(
                      elapsedTimeSinceFirstMintInSecondsNum / 3600,
                  )} hrs. `
                : elapsedTimeSinceFirstMintInSecondsNum < 172800
                ? '1 day '
                : `${Math.floor(
                      elapsedTimeSinceFirstMintInSecondsNum / 86400,
                  )} days `
            : 'Pending...';

    return {
        // wallet and id data
        ownerId: position.user,
        posHash,
        serverPositionId,
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
        elapsedTimeSinceFirstMintString,
        baseTokenAddress: position.base,
        quoteTokenAddress: position.quote,
    };
};
