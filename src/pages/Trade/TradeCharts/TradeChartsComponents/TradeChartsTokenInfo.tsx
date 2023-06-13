import styles from './TradeChartsTokenInfo.module.css';
import {
    NoColorTooltip,
    TextOnlyTooltip,
} from '../../../../components/Global/StyledTooltip/StyledTooltip';
import {
    useAppSelector,
    useAppDispatch,
} from '../../../../utils/hooks/reduxToolkit';
import NoTokenIcon from '../../../../components/Global/NoTokenIcon/NoTokenIcon';
import { memo, useContext } from 'react';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import { IS_LOCAL_ENV, ZERO_ADDRESS } from '../../../../constants';
import { FiCopy, FiExternalLink } from 'react-icons/fi';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import { UserPreferenceContext } from '../../../../contexts/UserPreferenceContext';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { PoolContext } from '../../../../contexts/PoolContext';

interface propsIF {
    simplifyVersion?: boolean;
}

function TradeChartsTokenInfo(props: propsIF) {
    const { simplifyVersion } = props;
    const dispatch = useAppDispatch();

    const { tradeData } = useAppSelector((state) => state);
    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);
    const {
        chainData: { chainId, poolIndex, blockExplorer },
    } = useContext(CrocEnvContext);
    const {
        poolPriceDisplay,
        isPoolPriceChangePositive,
        poolPriceChangePercent,
    } = useContext(PoolContext);
    const { favePools } = useContext(UserPreferenceContext);

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

    const poolPriceDisplayWithDenom = poolPriceDisplay
        ? tradeData.isDenomBase
            ? 1 / poolPriceDisplay
            : poolPriceDisplay
        : 0;

    const truncatedPoolPrice =
        poolPriceDisplay === Infinity || poolPriceDisplay === 0
            ? '…'
            : poolPriceDisplayWithDenom < 0.0001
            ? poolPriceDisplayWithDenom.toExponential(2)
            : poolPriceDisplayWithDenom < 2
            ? poolPriceDisplayWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : poolPriceDisplayWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    const smallScrenView = useMediaQuery('(max-width: 968px)');

    const logoSizes = smallScrenView ? '18px' : '25px';

    const poolPrice =
        poolPriceDisplay === Infinity || poolPriceDisplay === 0
            ? '…'
            : `${currencyCharacter}${truncatedPoolPrice}`;

    const currentAmountDisplay = (
        <span
            onClick={() => dispatch(toggleDidUserFlipDenom())}
            className={styles.amount}
            style={{ cursor: 'pointer' }}
            aria-label={poolPrice}
        >
            {poolPrice}
        </span>
    );

    const poolPriceNumber =
        poolPriceChangePercent === undefined ? '…' : poolPriceChangePercent;

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
                              color: 'var(--other-green)',
                              fontSize: '15px',
                          }
                        : {
                              color: 'var(--other-red)',
                              fontSize: '15px',
                          }
                }
                aria-label={`Pool price change is ${poolPriceNumber}`}
            >
                {poolPriceNumber}
            </span>
        </NoColorTooltip>
    );

    // fav button-------------------------------
    const currentPoolData = {
        base: tradeData.baseToken,
        quote: tradeData.quoteToken,
        chainId: chainId,
        poolId: poolIndex,
    };

    const isButtonFavorited = favePools.check(
        currentPoolData.base.address,
        currentPoolData.quote.address,
        currentPoolData.chainId,
        currentPoolData.poolId,
    );

    function handleFavButton() {
        isButtonFavorited
            ? favePools.remove(
                  tradeData.baseToken,
                  tradeData.quoteToken,
                  chainId,
                  poolIndex,
              )
            : favePools.add(
                  tradeData.quoteToken,
                  tradeData.baseToken,
                  chainId,
                  poolIndex,
              );
        IS_LOCAL_ENV && console.debug(tradeData);
    }

    const favButton = (
        <button
            className={styles.favorite_button}
            onClick={handleFavButton}
            id='trade_fav_button'
            role='button'
            tabIndex={0}
            aria-label={
                isButtonFavorited
                    ? ' Remove pool from favorites'
                    : 'Add pool from favorites'
            }
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
    const [_, copy] = useCopyToClipboard();

    function handleBaseCopy() {
        copy(tradeData.baseToken.address);
        openSnackbar(`${tradeData.baseToken.address} copied`);
    }
    function handleQuoteCopy() {
        copy(tradeData.quoteToken.address);
        openSnackbar(`${tradeData.quoteToken.address} copied`);
    }
    const handleLinkOut = (address: string) => {
        const addressLink = `${blockExplorer}token/${address}`;

        window.open(addressLink);
    };

    const baseTokenTooltipContentOrNull =
        tradeData.baseToken.address === ZERO_ADDRESS ? null : (
            <p>
                {`${tradeData.baseToken.symbol + ':'} ${
                    tradeData.baseToken.address
                }`}{' '}
                <FiCopy onClick={() => handleBaseCopy()} />{' '}
                <FiExternalLink
                    onClick={() => handleLinkOut(tradeData.baseToken.address)}
                />
            </p>
        );

    const tokenSymbols = (
        <div
            className={styles.mono_space_tooltip}
            style={{ cursor: 'default' }}
        >
            {baseTokenTooltipContentOrNull}
            <p>
                {`${tradeData.quoteToken.symbol}: ${tradeData.quoteToken.address}`}{' '}
                <FiCopy onClick={() => handleQuoteCopy()} />{' '}
                <FiExternalLink
                    onClick={() => handleLinkOut(tradeData.quoteToken.address)}
                />
            </p>
        </div>
    );

    const denomToggleButton = (
        <button
            className={styles.denom_toggle_button}
            aria-label='flip denomination.'
        >
            <TextOnlyTooltip
                interactive
                title={tokenSymbols}
                placement={'right'}
            >
                <div className={styles.tokens_images} id='trade_token_pair'>
                    {topTokenLogo ? (
                        <img src={topTokenLogo} alt={topTokenSymbol} />
                    ) : (
                        <NoTokenIcon
                            tokenInitial={topTokenSymbol?.charAt(0)}
                            width={logoSizes}
                        />
                    )}
                    {bottomTokenLogo ? (
                        <img src={bottomTokenLogo} alt={bottomTokenSymbol} />
                    ) : (
                        <NoTokenIcon
                            tokenInitial={bottomTokenSymbol?.charAt(0)}
                            width={logoSizes}
                        />
                    )}
                </div>
            </TextOnlyTooltip>

            <div
                className={styles.tokens_name}
                aria-live='polite'
                aria-atomic='true'
                aria-relevant='all'
                onClick={() => dispatch(toggleDidUserFlipDenom())}
            >
                {topTokenSymbol} / {bottomTokenSymbol}
            </div>
        </button>
    );

    // end of fav button-------------------------------

    const simpleHeaderDisplay = (
        <div className={styles.tokens_info_simplify}>
            <div className={styles.tokens_info_simplify_content}>
                {favButton}
                {denomToggleButton}
                {currentAmountDisplay}
                {poolPriceChange}
            </div>
        </div>
    );

    if (simplifyVersion) return simpleHeaderDisplay;

    return (
        <div className={styles.tokens_info}>
            {favButton}
            {denomToggleButton}
            {currentAmountDisplay}
            {poolPriceChange}
        </div>
    );
}

export default memo(TradeChartsTokenInfo);
