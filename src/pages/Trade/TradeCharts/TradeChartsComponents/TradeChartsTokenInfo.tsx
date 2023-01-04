import styles from './TradeChartsTokenInfo.module.css';
import {
    DefaultTooltip,
    GreenTextTooltip,
    NoColorTooltip,
    RedTextTooltip,
} from '../../../../components/Global/StyledTooltip/StyledTooltip';
import { useAppSelector, useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import NoTokenIcon from '../../../../components/Global/NoTokenIcon/NoTokenIcon';
import { Dispatch, SetStateAction } from 'react';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import { PoolIF, TokenIF } from '../../../../utils/interfaces/exports';

import {
    // tradeData as TradeDataIF,
    toggleDidUserFlipDenom,
} from '../../../../utils/state/tradeDataSlice';

interface TradeChartsTokenInfoPropsIF {
    isPoolPriceChangePositive: boolean;

    poolPriceDisplay: number;

    poolPriceChangePercent: string | undefined;

    setPoolPriceChangePercent: Dispatch<SetStateAction<string | undefined>>;

    favePools: PoolIF[];

    chainId: string;
    addPoolToFaves: (tokenA: TokenIF, tokenB: TokenIF, chainId: string, poolId: number) => void;
    removePoolFromFaves: (
        tokenA: TokenIF,
        tokenB: TokenIF,
        chainId: string,
        poolId: number,
    ) => void;

    simplifyVersion?: boolean;
}
export default function TradeChartsTokenInfo(props: TradeChartsTokenInfoPropsIF) {
    const {
        isPoolPriceChangePositive,
        poolPriceDisplay,
        poolPriceChangePercent,
        favePools,
        chainId,
        addPoolToFaves,
        removePoolFromFaves,
        simplifyVersion,
    } = props;
    const dispatch = useAppDispatch();

    const { tradeData } = useAppSelector((state) => state);

    const denomInBase = tradeData.isDenomBase;

    const topTokenLogo = denomInBase ? tradeData.baseToken.logoURI : tradeData.quoteToken.logoURI;
    const bottomTokenLogo = denomInBase
        ? tradeData.quoteToken.logoURI
        : tradeData.baseToken.logoURI;

    const topTokenSymbol = denomInBase ? tradeData.baseToken.symbol : tradeData.quoteToken.symbol;
    const bottomTokenSymbol = denomInBase
        ? tradeData.quoteToken.symbol
        : tradeData.baseToken.symbol;

    const currencyCharacter = denomInBase
        ? // denom in a, return token b character
          getUnicodeCharacter(tradeData.quoteToken.symbol)
        : // denom in b, return token a character
          getUnicodeCharacter(tradeData.baseToken.symbol);

    const truncatedPoolPrice =
        poolPriceDisplay === Infinity || poolPriceDisplay === 0
            ? '…'
            : poolPriceDisplay < 2
            ? poolPriceDisplay.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : poolPriceDisplay.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    const currentAmountDisplay = (
        <span className={styles.amount}>
            {poolPriceDisplay === Infinity || poolPriceDisplay === 0
                ? '…'
                : `${currencyCharacter}${truncatedPoolPrice}`}
        </span>
    );

    const poolPriceChange = (
        <NoColorTooltip
            title={'24 hour price change'}
            interactive
            placement={'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
        >
            <span
            // className={
            //     isPoolPriceChangePositive ? styles.change_positive : styles.change_negative
            // }
            >
                {poolPriceChangePercent === undefined ? '…' : poolPriceChangePercent}
                {/* {poolPriceChangePercent === undefined ? '…' : poolPriceChangePercent + ' | 24h'} */}
            </span>
        </NoColorTooltip>
    );

    const amountWithTooltipGreen = (
        <GreenTextTooltip
            interactive
            title={poolPriceChange}
            placement={'right'}
            arrow
            enterDelay={100}
            leaveDelay={200}
        >
            {currentAmountDisplay}
        </GreenTextTooltip>
    );

    const amountWithTooltipRed = (
        <RedTextTooltip
            interactive
            title={poolPriceChange}
            placement={'right'}
            arrow
            enterDelay={100}
            leaveDelay={200}
        >
            {currentAmountDisplay}
        </RedTextTooltip>
    );

    // fav button-------------------------------
    const currentPoolData = {
        base: tradeData.baseToken,
        quote: tradeData.quoteToken,
        chainId: chainId,
        poolId: 36000,
    };

    const isButtonFavorited = favePools?.some(
        (pool: PoolIF) =>
            pool.base.address === currentPoolData.base.address &&
            pool.quote.address === currentPoolData.quote.address &&
            pool.poolId === currentPoolData.poolId &&
            pool.chainId.toString() === currentPoolData.chainId.toString(),
    );

    const handleFavButton = () =>
        isButtonFavorited
            ? removePoolFromFaves(tradeData.baseToken, tradeData.quoteToken, chainId, 36000)
            : addPoolToFaves(tradeData.quoteToken, tradeData.baseToken, chainId, 36000);

    const favButton = (
        <button className={styles.favorite_button} onClick={handleFavButton}>
            {
                <svg
                    width='30'
                    height='30'
                    viewBox='0 0 15 15'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                >
                    <g clipPath='url(#clip0_1874_47746)'>
                        <path
                            d='M12.8308 3.34315C12.5303 3.04162 12.1732 2.80237 11.7801 2.63912C11.3869 2.47588 10.9654 2.39185 10.5397 2.39185C10.1141 2.39185 9.69255 2.47588 9.29941 2.63912C8.90626 2.80237 8.54921 3.04162 8.24873 3.34315L7.78753 3.81033L7.32633 3.34315C7.02584 3.04162 6.66879 2.80237 6.27565 2.63912C5.8825 2.47588 5.461 2.39185 5.03531 2.39185C4.60962 2.39185 4.18812 2.47588 3.79498 2.63912C3.40183 2.80237 3.04478 3.04162 2.7443 3.34315C1.47451 4.61294 1.39664 6.75721 2.99586 8.38637L7.78753 13.178L12.5792 8.38637C14.1784 6.75721 14.1005 4.61294 12.8308 3.34315Z'
                            fill={isButtonFavorited ? '#EBEBFF' : 'none'}
                            stroke='#EBEBFF'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        />
                    </g>
                    <defs>
                        <clipPath id='clip0_1874_47746'>
                            <rect
                                width='14'
                                height='14'
                                fill='white'
                                transform='translate(0.600098 0.599976)'
                            />
                        </clipPath>
                    </defs>
                </svg>
            }
        </button>
    );

    // end of fav button-------------------------------

    const simpleHeaderDisplay = (
        <div className={styles.tokens_info_simplify}>
            <div className={styles.tokens_info_simplify_content}>
                {favButton}
                <section>
                    <DefaultTooltip
                        interactive
                        title={`${
                            tradeData.baseToken.symbol !== 'ETH'
                                ? tradeData.baseToken.symbol + ':'
                                : ''
                        } ${
                            tradeData.baseToken.symbol !== 'ETH' ? tradeData.baseToken.address : ''
                        } ${tradeData.quoteToken.symbol}: ${tradeData.quoteToken.address}`}
                        placement={'top'}
                    >
                        <div
                            className={styles.tokens_images}
                            onClick={() => dispatch(toggleDidUserFlipDenom())}
                        >
                            {topTokenLogo ? (
                                <img src={topTokenLogo} alt={topTokenSymbol} />
                            ) : (
                                <NoTokenIcon tokenInitial={topTokenSymbol.charAt(0)} width='25px' />
                            )}
                            {bottomTokenLogo ? (
                                <img src={bottomTokenLogo} alt={bottomTokenSymbol} />
                            ) : (
                                <NoTokenIcon
                                    tokenInitial={bottomTokenSymbol.charAt(0)}
                                    width='25px'
                                />
                            )}
                        </div>
                    </DefaultTooltip>
                    <DefaultTooltip
                        interactive
                        title={`${
                            tradeData.baseToken.symbol !== 'ETH'
                                ? tradeData.baseToken.symbol + ':'
                                : ''
                        } ${
                            tradeData.baseToken.symbol !== 'ETH' ? tradeData.baseToken.address : ''
                        } ${tradeData.quoteToken.symbol}: ${tradeData.quoteToken.address}`}
                        placement={'top'}
                    >
                        <div
                            className={styles.tokens_name}
                            onClick={() => dispatch(toggleDidUserFlipDenom())}
                        >
                            {topTokenSymbol} / {bottomTokenSymbol}
                            {/* {denomInBase ? tradeData.baseToken.symbol : tradeData.quoteToken.symbol} /{' '} */}
                            {/* {denomInBase ? tradeData.quoteToken.symbol : tradeData.baseToken.symbol} */}
                        </div>
                    </DefaultTooltip>
                </section>
                {isPoolPriceChangePositive ? amountWithTooltipGreen : amountWithTooltipRed}
            </div>
        </div>
    );

    if (simplifyVersion) return simpleHeaderDisplay;

    return (
        <div className={styles.tokens_info}>
            <DefaultTooltip
                interactive
                title={`${
                    tradeData.baseToken.symbol !== 'ETH' ? tradeData.baseToken.symbol + ':' : ''
                } ${tradeData.baseToken.symbol !== 'ETH' ? tradeData.baseToken.address : ''} ${
                    tradeData.quoteToken.symbol
                }: ${tradeData.quoteToken.address}`}
                placement={'top'}
            >
                <div
                    className={styles.tokens_images}
                    onClick={() => dispatch(toggleDidUserFlipDenom())}
                >
                    {topTokenLogo ? (
                        <img src={topTokenLogo} alt={topTokenSymbol} />
                    ) : (
                        <NoTokenIcon tokenInitial={topTokenSymbol.charAt(0)} width='25px' />
                    )}
                    {bottomTokenLogo ? (
                        <img src={bottomTokenLogo} alt={bottomTokenSymbol} />
                    ) : (
                        <NoTokenIcon tokenInitial={bottomTokenSymbol.charAt(0)} width='25px' />
                    )}
                </div>
            </DefaultTooltip>
            <DefaultTooltip
                interactive
                title={`${
                    tradeData.baseToken.symbol !== 'ETH' ? tradeData.baseToken.symbol + ':' : ''
                } ${tradeData.baseToken.symbol !== 'ETH' ? tradeData.baseToken.address : ''} ${
                    tradeData.quoteToken.symbol
                }: ${tradeData.quoteToken.address}`}
                placement={'top'}
            >
                <div
                    className={styles.tokens_name}
                    onClick={() => dispatch(toggleDidUserFlipDenom())}
                >
                    {topTokenSymbol} / {bottomTokenSymbol}
                    {/* {denomInBase ? tradeData.baseToken.symbol : tradeData.quoteToken.symbol} /{' '} */}
                    {/* {denomInBase ? tradeData.quoteToken.symbol : tradeData.baseToken.symbol} */}
                </div>
            </DefaultTooltip>

            {isPoolPriceChangePositive ? amountWithTooltipGreen : amountWithTooltipRed}
        </div>
    );
}
