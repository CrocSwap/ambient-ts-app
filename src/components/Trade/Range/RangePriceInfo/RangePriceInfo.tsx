// START: Import Local Files
import styles from './RangePriceInfo.module.css';
// import truncateDecimals from '../../../../utils/data/truncateDecimals';
// import makeCurrentPrice from './makeCurrentPrice';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';
import { memo, useContext, useEffect, useMemo, useState } from 'react';
import { testTokenMap } from '../../../../utils/data/testTokenMap';
import { DefaultTooltip } from '../../../Global/StyledTooltip/StyledTooltip';
import { isStableToken } from '../../../../utils/data/stablePairs';

import { AppStateContext } from '../../../../contexts/AppStateContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { CachedDataContext } from '../../../../contexts/CachedDataContext';
import { ZERO_ADDRESS } from '../../../../constants';
import { getFormattedNumber } from '../../../../App/functions/getFormattedNumber';

// interface for component props
interface propsIF {
    spotPriceDisplay: string;
    aprPercentage: number | undefined;
    poolPriceCharacter: string;
    isTokenABase: boolean;
    pinnedDisplayPrices:
        | {
              pinnedMinPriceDisplay: string;
              pinnedMaxPriceDisplay: string;
              pinnedMinPriceDisplayTruncated: string;
              pinnedMaxPriceDisplayTruncated: string;
              pinnedMinPriceDisplayTruncatedWithCommas: string;
              pinnedMaxPriceDisplayTruncatedWithCommas: string;
              pinnedLowTick: number;
              pinnedHighTick: number;
              pinnedMinPriceNonDisplay: number;
              pinnedMaxPriceNonDisplay: number;
          }
        | undefined;
    isAmbient: boolean;
}

// central react functional component
function RangePriceInfo(props: propsIF) {
    const {
        spotPriceDisplay,
        poolPriceCharacter,
        aprPercentage,
        pinnedDisplayPrices,
        isTokenABase,
        isAmbient,
    } = props;
    const {
        // eslint-disable-next-line
        globalPopup: { open: openGlobalPopup },
    } = useContext(AppStateContext);
    const { cachedFetchTokenPrice } = useContext(CachedDataContext);
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    const { isDenomBase, tokenA, tokenB, baseToken, quoteToken } =
        useAppSelector((state) => state.tradeData);

    const dispatch = useAppDispatch();

    const aprPercentageString = aprPercentage
        ? `${aprPercentage.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })}%`
        : '…';
    // JSX frag for estimated APR of position

    const aprDisplay = (
        <div className={styles.price_display}>
            <h4 className={styles.price_title}>Est. APR</h4>
            <span
                className={styles.apr_price}
                onClick={() => {
                    dispatch(toggleDidUserFlipDenom());
                    setUserFlippedMaxMinDisplay(false);
                }}
            >
                {aprPercentageString}
                {/* <AiOutlineQuestionCircle
                size={14}
                onClick={() =>
                    openGlobalPopup(
                        <AprExplanation />,

                        'Estimated APR',
                        'right',
                    )
                }
            /> */}
            </span>
        </div>
    );

    const [tokenAMainnetPrice, setTokenAMainnetPrice] = useState<
        number | undefined
    >();
    const [tokenBMainnetPrice, setTokenBMainnetPrice] = useState<
        number | undefined
    >();

    const [userFlippedMaxMinDisplay, setUserFlippedMaxMinDisplay] =
        useState<boolean>(false);

    const [poolPriceUsdEquivalent, setPoolPriceUsdEquivalent] =
        useState<string>('');

    const [minPriceUsdEquivalent, setMinPriceUsdEquivalent] =
        useState<string>('');
    // eslint-disable-next-line
    const [maxPriceUsdEquivalent, setMaxPriceUsdEquivalent] =
        useState<string>('');

    const tokenAAddress = tokenA.address;
    const tokenBAddress = tokenB.address;

    const minPrice = userFlippedMaxMinDisplay
        ? isAmbient
            ? '$0'
            : minPriceUsdEquivalent
        : isAmbient
        ? '0'
        : pinnedDisplayPrices
        ? poolPriceCharacter +
          pinnedDisplayPrices.pinnedMinPriceDisplayTruncatedWithCommas
        : '...';

    const maxPrice = userFlippedMaxMinDisplay
        ? isAmbient
            ? '$∞'
            : maxPriceUsdEquivalent
        : isAmbient
        ? '∞'
        : pinnedDisplayPrices
        ? poolPriceCharacter +
          pinnedDisplayPrices.pinnedMaxPriceDisplayTruncatedWithCommas
        : '...';

    const isDenomTokenA =
        (isDenomBase && isTokenABase) || (!isDenomBase && !isTokenABase);

    const pinnedMinPrice = pinnedDisplayPrices?.pinnedMinPriceDisplay;
    const pinnedMaxPrice = pinnedDisplayPrices?.pinnedMaxPriceDisplay;

    const currentPrice = userFlippedMaxMinDisplay
        ? poolPriceUsdEquivalent
        : poolPriceCharacter + spotPriceDisplay;

    const isStableTokenA = useMemo(
        () => isStableToken(tokenAAddress, chainId),
        [tokenAAddress, chainId],
    );

    const isStableTokenB = useMemo(
        () => isStableToken(tokenBAddress, chainId),
        [tokenBAddress, chainId],
    );

    const isEitherTokenStable = isStableTokenA || isStableTokenB;

    const updatePoolPriceUsdEquivalent = () => {
        const spotPriceNum = parseFloat(spotPriceDisplay.replaceAll(',', ''));
        if (!tokenBMainnetPrice || !tokenAMainnetPrice) return;

        let poolPriceNum;

        if (isDenomTokenA) {
            poolPriceNum = spotPriceNum * tokenBMainnetPrice;
        } else {
            poolPriceNum = spotPriceNum * tokenAMainnetPrice;
        }

        const displayUsdPriceString = getFormattedNumber({
            value: poolPriceNum,
            zeroDisplay: '…',
            prefix: '~$',
        });
        setPoolPriceUsdEquivalent(displayUsdPriceString);
    };

    useEffect(() => {
        updatePoolPriceUsdEquivalent();
    }, [
        spotPriceDisplay,
        isDenomTokenA,
        tokenAMainnetPrice,
        tokenBMainnetPrice,
        tokenAAddress + tokenBAddress,
    ]);

    const updateMainnetPricesAsync = async () => {
        const tokenAMainnetEquivalent =
            chainId === '0x1' && tokenAAddress !== ZERO_ADDRESS
                ? tokenAAddress
                : testTokenMap
                      .get(tokenAAddress.toLowerCase() + '_' + chainId)
                      ?.split('_')[0];
        const tokenBMainnetEquivalent =
            chainId === '0x1' && tokenBAddress !== ZERO_ADDRESS
                ? tokenBAddress
                : testTokenMap
                      .get(tokenBAddress.toLowerCase() + '_' + chainId)
                      ?.split('_')[0];

        if (tokenAMainnetEquivalent) {
            const tokenAMainnetPrice = await cachedFetchTokenPrice(
                tokenAMainnetEquivalent,
                '0x1',
            );
            const usdPrice = tokenAMainnetPrice?.usdPrice;

            setTokenAMainnetPrice(usdPrice);
        } else {
            setTokenAMainnetPrice(undefined);
        }

        if (tokenBMainnetEquivalent) {
            const tokenBMainnetPrice = await cachedFetchTokenPrice(
                tokenBMainnetEquivalent,
                '0x1',
            );
            const usdPrice = tokenBMainnetPrice?.usdPrice;
            setTokenBMainnetPrice(usdPrice);
        } else {
            setTokenBMainnetPrice(undefined);
        }
    };

    useEffect(() => {
        setUserFlippedMaxMinDisplay(false);

        updateMainnetPricesAsync();
    }, [tokenAAddress + tokenBAddress, isDenomTokenA]);

    useEffect(() => {
        if (!pinnedMinPrice || !pinnedMaxPrice) return;

        let minPriceNum, maxPriceNum;

        if (isDenomTokenA) {
            minPriceNum =
                parseFloat(pinnedMinPrice) * (tokenBMainnetPrice || 0);

            maxPriceNum =
                parseFloat(pinnedMaxPrice) * (tokenBMainnetPrice || 0);
        } else {
            minPriceNum =
                parseFloat(pinnedMinPrice) * (tokenAMainnetPrice || 0);

            maxPriceNum =
                parseFloat(pinnedMaxPrice) * (tokenAMainnetPrice || 0);
        }

        const minDisplayUsdPriceString = getFormattedNumber({
            value: minPriceNum,
            zeroDisplay: '…',
            prefix: '~$',
        });
        setMinPriceUsdEquivalent(minDisplayUsdPriceString);

        const maxDisplayUsdPriceString = getFormattedNumber({
            value: maxPriceNum,
            zeroDisplay: '…',
            prefix: '~$',
        });
        setMaxPriceUsdEquivalent(maxDisplayUsdPriceString);
    }, [
        pinnedMinPrice,
        pinnedMaxPrice,
        userFlippedMaxMinDisplay,
        isDenomTokenA,
        tokenBMainnetPrice,
        tokenAMainnetPrice,
    ]);

    const handleMinMaxPriceClick = () => {
        setUserFlippedMaxMinDisplay(!userFlippedMaxMinDisplay);
    };

    // JSX frag for lowest price in range

    const denomTokenDollarEquivalentExists = isDenomTokenA
        ? tokenAMainnetPrice !== undefined
        : tokenBMainnetPrice !== undefined;

    const nonDenomTokenDollarEquivalentExists = !isDenomTokenA
        ? tokenAMainnetPrice !== undefined
        : tokenBMainnetPrice !== undefined;

    const minimumPrice =
        denomTokenDollarEquivalentExists && !isEitherTokenStable ? (
            <DefaultTooltip
                interactive
                title={`${minPriceUsdEquivalent} USD per ${
                    isDenomBase ? baseToken.symbol : quoteToken.symbol
                } `}
                placement={'bottom'}
                arrow
                enterDelay={100}
                leaveDelay={200}
            >
                <div
                    className={styles.price_display}
                    onClick={handleMinMaxPriceClick}
                >
                    <h4 className={styles.price_title}>Min Price</h4>
                    <span className={styles.min_price}>{minPrice}</span>
                </div>
            </DefaultTooltip>
        ) : (
            <div className={styles.price_display} style={{ cursor: 'default' }}>
                <h4 className={styles.price_title}>Min Price</h4>
                <span className={styles.min_price}>{minPrice}</span>
            </div>
        );

    // JSX frag for highest price in range
    const maximumPrice =
        nonDenomTokenDollarEquivalentExists && !isEitherTokenStable ? (
            <DefaultTooltip
                interactive
                title={`${maxPriceUsdEquivalent} USD per ${
                    isDenomBase ? baseToken.symbol : quoteToken.symbol
                } `}
                placement={'bottom'}
                arrow
                enterDelay={100}
                leaveDelay={200}
            >
                <div
                    className={styles.price_display}
                    onClick={handleMinMaxPriceClick}
                >
                    <h4 className={styles.price_title}>Max Price</h4>
                    <span className={styles.max_price}>{maxPrice}</span>
                </div>
            </DefaultTooltip>
        ) : (
            <div className={styles.price_display} style={{ cursor: 'default' }}>
                <h4 className={styles.price_title}>Max Price</h4>
                <span className={styles.max_price}>{maxPrice}</span>
            </div>
        );

    return (
        <div className={styles.price_info_container}>
            <div className={styles.price_info_content}>
                {aprDisplay}
                {minimumPrice}
                {maximumPrice}
            </div>
        </div>
    );
}

export default memo(RangePriceInfo);
