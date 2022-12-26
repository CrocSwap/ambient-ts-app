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
import { BsHeart, BsHeartFill } from 'react-icons/bs';

import {
    // tradeData as TradeDataIF,
    toggleDidUserFlipDenom,
} from '../../../../utils/state/tradeDataSlice';

interface TradeChartsTokenInfoPropsIF {
    setIsPoolPriceChangePositive: Dispatch<SetStateAction<boolean>>;

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
            {isButtonFavorited ? <BsHeartFill color='#cdc1ff' size={22} /> : <BsHeart size={22} />}
        </button>
    );

    // end of fav button-------------------------------

    return (
        <div className={styles.tokens_info}>
            {favButton}

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
