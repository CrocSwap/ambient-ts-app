import { NoColorTooltip } from '../../../../components/Global/StyledTooltip/StyledTooltip';
import {
    useAppSelector,
    useAppDispatch,
} from '../../../../utils/hooks/reduxToolkit';
import { memo, useContext } from 'react';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import { IS_LOCAL_ENV } from '../../../../constants';
import { UserPreferenceContext } from '../../../../contexts/UserPreferenceContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { PoolContext } from '../../../../contexts/PoolContext';
import TokenIcon from '../../../../components/Global/TokenIcon/TokenIcon';
import { getFormattedNumber } from '../../../../App/functions/getFormattedNumber';
import { TokenIF } from '../../../../utils/interfaces/exports';
import { FlexContainer } from '../../../../styled/Common';
import { HeaderButtons, HeaderText } from '../../../../styled/Components/Chart';

function TradeChartsTokenInfo() {
    const dispatch = useAppDispatch();

    const { tradeData } = useAppSelector((state) => state);
    const {
        chainData: { chainId, poolIndex },
    } = useContext(CrocEnvContext);
    const {
        poolPriceDisplay,
        isPoolPriceChangePositive,
        poolPriceChangePercent,
    } = useContext(PoolContext);
    const { favePools } = useContext(UserPreferenceContext);

    const denomInBase = tradeData.isDenomBase;

    const [topToken, bottomToken]: [TokenIF, TokenIF] = denomInBase
        ? [tradeData.baseToken, tradeData.quoteToken]
        : [tradeData.quoteToken, tradeData.baseToken];

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

    const truncatedPoolPrice = getFormattedNumber({
        value: poolPriceDisplayWithDenom,
        abbrevThreshold: 10000000, // use 'm', 'b' format > 10m
    });

    const smallScrenView = useMediaQuery('(max-width: 968px)');

    const poolPrice =
        poolPriceDisplay === Infinity ||
        poolPriceDisplay === 0 ||
        poolPriceDisplay === undefined
            ? '…'
            : `${currencyCharacter}${truncatedPoolPrice}`;

    const currentAmountDisplay = (
        <span
            onClick={() => dispatch(toggleDidUserFlipDenom())}
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
            placement='right'
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
        <HeaderButtons
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
        </HeaderButtons>
    );

    const denomToggleButton = (
        <HeaderButtons
            aria-label='flip denomination.'
            onClick={() => dispatch(toggleDidUserFlipDenom())}
        >
            <FlexContainer id='trade_token_pair' role='button' gap={4}>
                <TokenIcon
                    token={topToken}
                    src={topToken.logoURI}
                    alt={topToken.symbol}
                    size={smallScrenView ? 's' : 'l'}
                />
                <TokenIcon
                    token={bottomToken}
                    src={bottomToken.logoURI}
                    alt={bottomToken.symbol}
                    size={smallScrenView ? 's' : 'l'}
                />
            </FlexContainer>
            <HeaderText
                fontSize='header1'
                fontWeight='300'
                color='text1'
                role='button'
                aria-live='polite'
                aria-atomic='true'
                aria-relevant='all'
            >
                {topToken.symbol} / {bottomToken.symbol}
            </HeaderText>
        </HeaderButtons>
    );

    // end of fav button-------------------------------

    return (
        <FlexContainer alignItems='center' gap={16}>
            {favButton}
            {denomToggleButton}
            {currentAmountDisplay}
            {poolPriceChange}
        </FlexContainer>
    );
}

export default memo(TradeChartsTokenInfo);
