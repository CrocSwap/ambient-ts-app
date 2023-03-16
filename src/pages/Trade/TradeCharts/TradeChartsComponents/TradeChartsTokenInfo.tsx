import styles from './TradeChartsTokenInfo.module.css';
import {
    DefaultTooltip,
    NoColorTooltip,
} from '../../../../components/Global/StyledTooltip/StyledTooltip';
import {
    useAppSelector,
    useAppDispatch,
} from '../../../../utils/hooks/reduxToolkit';
import NoTokenIcon from '../../../../components/Global/NoTokenIcon/NoTokenIcon';
import { Dispatch, SetStateAction } from 'react';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import { favePoolsMethodsIF } from '../../../../App/hooks/useFavePools';

interface propsIF {
    isPoolPriceChangePositive: boolean;
    poolPriceDisplay: number;
    poolPriceChangePercent: string | undefined;
    setPoolPriceChangePercent: Dispatch<SetStateAction<string | undefined>>;
    favePools: favePoolsMethodsIF;
    chainId: string;
    simplifyVersion?: boolean;
}

export default function TradeChartsTokenInfo(props: propsIF) {
    const {
        isPoolPriceChangePositive,
        poolPriceDisplay,
        poolPriceChangePercent,
        favePools,
        chainId,
        simplifyVersion,
    } = props;
    const dispatch = useAppDispatch();

    const { tradeData } = useAppSelector((state) => state);

    const denomInBase = tradeData.isDenomBase;

    const topTokenLogo = denomInBase
        ? tradeData.baseToken.logoURI
        : tradeData.quoteToken.logoURI;
    const bottomTokenLogo = denomInBase
        ? tradeData.quoteToken.logoURI
        : tradeData.baseToken.logoURI;

    const topTokenSymbol = denomInBase
        ? tradeData.baseToken.symbol
        : tradeData.quoteToken.symbol;
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

    const smallScrenView = useMediaQuery('(max-width: 968px)');

    const logoSizes = smallScrenView ? '18px' : '25px';

    const currentAmountDisplay = (
        <span
            onClick={() => dispatch(toggleDidUserFlipDenom())}
            className={styles.amount}
            style={{ marginTop: '2.5px', cursor: 'pointer' }}
        >
            {poolPriceDisplay === Infinity || poolPriceDisplay === 0
                ? '…'
                : `${currencyCharacter}${truncatedPoolPrice}`}
        </span>
    );

    const poolPriceChange = (
        <NoColorTooltip
            title={'24 hour price change'}
            interactive
            placement={simplifyVersion ? 'left' : 'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
        >
            <span
                style={
                    isPoolPriceChangePositive
                        ? {
                              color: 'green',
                              marginTop: '4.5px',
                              fontSize: '15px',
                          }
                        : { color: 'red', marginTop: '4.5px', fontSize: '15px' }
                }
            >
                {poolPriceChangePercent === undefined
                    ? '…'
                    : poolPriceChangePercent}
            </span>
        </NoColorTooltip>
    );

    // fav button-------------------------------
    const currentPoolData = {
        base: tradeData.baseToken,
        quote: tradeData.quoteToken,
        chainId: chainId,
        poolId: 36000,
    };

    const isButtonFavorited = favePools.check(
        currentPoolData.base.address,
        currentPoolData.quote.address,
        currentPoolData.chainId,
        currentPoolData.poolId,
    );

    const handleFavButton = () =>
        isButtonFavorited
            ? favePools.remove(
                  tradeData.baseToken,
                  tradeData.quoteToken,
                  chainId,
                  36000,
              )
            : favePools.add(
                  tradeData.quoteToken,
                  tradeData.baseToken,
                  chainId,
                  36000,
              );

    const favButton = (
        <button
            className={styles.favorite_button}
            onClick={handleFavButton}
            id='trade_fav_button'
        >
            {
                <svg
                    width={smallScrenView ? '20px' : '30px'}
                    height={smallScrenView ? '20px' : '30px'}
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
                        title={`${tradeData.baseToken.symbol + ':'} ${
                            tradeData.baseToken.address
                        } ${tradeData.quoteToken.symbol}: ${
                            tradeData.quoteToken.address
                        }`}
                        placement={'top'}
                    >
                        <div
                            className={styles.tokens_images}
                            onClick={() => dispatch(toggleDidUserFlipDenom())}
                        >
                            {topTokenLogo ? (
                                <img src={topTokenLogo} alt={topTokenSymbol} />
                            ) : (
                                <NoTokenIcon
                                    tokenInitial={topTokenSymbol.charAt(0)}
                                    width={logoSizes}
                                />
                            )}
                            {bottomTokenLogo ? (
                                <img
                                    src={bottomTokenLogo}
                                    alt={bottomTokenSymbol}
                                />
                            ) : (
                                <NoTokenIcon
                                    tokenInitial={bottomTokenSymbol.charAt(0)}
                                    width={logoSizes}
                                />
                            )}
                        </div>
                    </DefaultTooltip>
                    <DefaultTooltip
                        interactive
                        title={`${tradeData.baseToken.symbol + ':'} ${
                            tradeData.baseToken.address
                        } ${tradeData.quoteToken.symbol}: ${
                            tradeData.quoteToken.address
                        }`}
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
                {/* {isPoolPriceChangePositive ? amountWithTooltipGreen : amountWithTooltipRed} */}
                {currentAmountDisplay}
                {poolPriceChange}
            </div>
        </div>
    );

    if (simplifyVersion) return simpleHeaderDisplay;

    return (
        <div className={styles.tokens_info}>
            {favButton}
            <DefaultTooltip
                interactive
                title={`${tradeData.baseToken.symbol + ':'} ${
                    tradeData.baseToken.address
                } ${tradeData.quoteToken.symbol}: ${
                    tradeData.quoteToken.address
                }`}
                placement={'top'}
            >
                <div
                    className={styles.tokens_images}
                    id='trade_token_pair'
                    onClick={() => dispatch(toggleDidUserFlipDenom())}
                >
                    {topTokenLogo ? (
                        <img src={topTokenLogo} alt={topTokenSymbol} />
                    ) : (
                        <NoTokenIcon
                            tokenInitial={topTokenSymbol.charAt(0)}
                            width={logoSizes}
                        />
                    )}
                    {bottomTokenLogo ? (
                        <img src={bottomTokenLogo} alt={bottomTokenSymbol} />
                    ) : (
                        <NoTokenIcon
                            tokenInitial={bottomTokenSymbol.charAt(0)}
                            width={logoSizes}
                        />
                    )}
                </div>
            </DefaultTooltip>
            <DefaultTooltip
                interactive
                title={`${tradeData.baseToken.symbol + ':'} ${
                    tradeData.baseToken.address
                } ${tradeData.quoteToken.symbol}: ${
                    tradeData.quoteToken.address
                }`}
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
            {currentAmountDisplay}
            {poolPriceChange}
            {/* {isPoolPriceChangePositive ? amountWithTooltipGreen : amountWithTooltipRed} */}
        </div>
    );
}
